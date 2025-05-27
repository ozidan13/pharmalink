"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.registerPharmacyOwner = exports.registerPharmacist = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../../server");
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const JWT_SECRET = process.env.JWT_SECRET;
// Helper function to generate JWT token
const generateToken = (id, email, role) => {
    return jsonwebtoken_1.default.sign({ id, email, role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
};
// Register a new pharmacist
const registerPharmacist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, firstName, lastName, phoneNumber, bio, experience, education, latitude, longitude } = req.body;
        // Check if user already exists
        const existingUser = yield server_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        // Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Create user and pharmacist profile in a transaction
        const result = yield server_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Create user
            const user = yield prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: client_1.UserRole.PHARMACIST
                }
            });
            // Create pharmacist profile
            const pharmacistProfile = yield prisma.pharmacistProfile.create({
                data: {
                    userId: user.id,
                    firstName,
                    lastName,
                    phoneNumber,
                    bio,
                    experience,
                    education,
                    latitude,
                    longitude
                }
            });
            return { user, pharmacistProfile };
        }));
        // Generate JWT token
        const token = generateToken(result.user.id, result.user.email, result.user.role);
        // Return user data and token
        return res.status(201).json({
            message: 'Pharmacist registered successfully',
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
                profile: {
                    firstName: result.pharmacistProfile.firstName,
                    lastName: result.pharmacistProfile.lastName
                }
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});
exports.registerPharmacist = registerPharmacist;
// Register a new pharmacy owner
const registerPharmacyOwner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, pharmacyName, contactPerson, phoneNumber, address, latitude, longitude } = req.body;
        // Check if user already exists
        const existingUser = yield server_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        // Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Create user and pharmacy owner profile in a transaction
        const result = yield server_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Create user
            const user = yield prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: client_1.UserRole.PHARMACY_OWNER
                }
            });
            // Create pharmacy owner profile
            const pharmacyOwnerProfile = yield prisma.pharmacyOwnerProfile.create({
                data: {
                    userId: user.id,
                    pharmacyName,
                    contactPerson,
                    phoneNumber,
                    address,
                    latitude,
                    longitude
                }
            });
            return { user, pharmacyOwnerProfile };
        }));
        // Generate JWT token
        const token = generateToken(result.user.id, result.user.email, result.user.role);
        // Return user data and token
        return res.status(201).json({
            message: 'Pharmacy owner registered successfully',
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
                profile: {
                    pharmacyName: result.pharmacyOwnerProfile.pharmacyName,
                    contactPerson: result.pharmacyOwnerProfile.contactPerson
                }
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});
exports.registerPharmacyOwner = registerPharmacyOwner;
// Login user (both pharmacist and pharmacy owner)
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        // Find user by email
        const user = yield server_1.prisma.user.findUnique({
            where: { email },
            include: {
                pharmacistProfile: true,
                pharmacyOwnerProfile: true
            }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Check password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = generateToken(user.id, user.email, user.role);
        // Prepare profile data based on user role
        let profileData = {};
        if (user.role === client_1.UserRole.PHARMACIST && user.pharmacistProfile) {
            profileData = {
                firstName: user.pharmacistProfile.firstName,
                lastName: user.pharmacistProfile.lastName
            };
        }
        else if (user.role === client_1.UserRole.PHARMACY_OWNER && user.pharmacyOwnerProfile) {
            profileData = {
                pharmacyName: user.pharmacyOwnerProfile.pharmacyName,
                contactPerson: user.pharmacyOwnerProfile.contactPerson
            };
        }
        // Return user data and token
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: profileData
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error during login' });
    }
});
exports.login = login;
