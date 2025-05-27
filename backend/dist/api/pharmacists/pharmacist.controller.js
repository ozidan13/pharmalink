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
exports.uploadCV = exports.searchPharmacists = exports.getPharmacistById = exports.updateProfile = exports.getProfile = void 0;
const server_1 = require("../../server");
const express_validator_1 = require("express-validator");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Get the current pharmacist's profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const profile = yield server_1.prisma.pharmacistProfile.findUnique({
            where: { userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                cvUrl: true,
                bio: true,
                experience: true,
                education: true,
                latitude: true,
                longitude: true,
                available: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!profile) {
            return res.status(404).json({ message: 'Pharmacist profile not found' });
        }
        return res.status(200).json(profile);
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ message: 'Server error while fetching profile' });
    }
});
exports.getProfile = getProfile;
// Update the current pharmacist's profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { firstName, lastName, phoneNumber, bio, experience, education, latitude, longitude, available } = req.body;
        // Update profile
        const updatedProfile = yield server_1.prisma.pharmacistProfile.update({
            where: { userId },
            data: {
                firstName,
                lastName,
                phoneNumber,
                bio,
                experience,
                education,
                latitude,
                longitude,
                available: available !== undefined ? available : undefined
            }
        });
        return res.status(200).json({
            message: 'Profile updated successfully',
            profile: updatedProfile
        });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Server error while updating profile' });
    }
});
exports.updateProfile = updateProfile;
// Get a specific pharmacist by ID (for pharmacy owners)
const getPharmacistById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // Check if the pharmacy owner has a valid subscription
        const pharmacyOwner = yield server_1.prisma.pharmacyOwnerProfile.findUnique({
            where: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }
        });
        if (!pharmacyOwner) {
            return res.status(404).json({ message: 'Pharmacy owner profile not found' });
        }
        // Basic subscription check (can be expanded based on business rules)
        const hasValidSubscription = pharmacyOwner.subscriptionStatus !== 'none' &&
            (!pharmacyOwner.subscriptionExpiresAt || new Date(pharmacyOwner.subscriptionExpiresAt) > new Date());
        if (!hasValidSubscription) {
            return res.status(403).json({ message: 'Active subscription required to view pharmacist details' });
        }
        // Get pharmacist profile
        const pharmacist = yield server_1.prisma.pharmacistProfile.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                cvUrl: true,
                bio: true,
                experience: true,
                education: true,
                latitude: true,
                longitude: true,
                available: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!pharmacist) {
            return res.status(404).json({ message: 'Pharmacist not found' });
        }
        return res.status(200).json(pharmacist);
    }
    catch (error) {
        console.error('Error fetching pharmacist:', error);
        return res.status(500).json({ message: 'Server error while fetching pharmacist' });
    }
});
exports.getPharmacistById = getPharmacistById;
// Search for pharmacists based on location and other criteria
const searchPharmacists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { latitude, longitude, radius = 10, available } = req.query;
        // Check if the pharmacy owner has a valid subscription
        const pharmacyOwner = yield server_1.prisma.pharmacyOwnerProfile.findUnique({
            where: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }
        });
        if (!pharmacyOwner) {
            return res.status(404).json({ message: 'Pharmacy owner profile not found' });
        }
        // Determine search radius based on subscription status
        let maxRadius = 10; // Default radius in km
        if (pharmacyOwner.subscriptionStatus === 'premium') {
            maxRadius = 50;
        }
        else if (pharmacyOwner.subscriptionStatus === 'basic') {
            maxRadius = 25;
        }
        // Use the smaller of the requested radius and the max allowed radius
        const searchRadius = Math.min(Number(radius), maxRadius);
        // Build the availability filter
        const availabilityFilter = available === 'true' ? 'AND available = true' : '';
        // Use PostGIS to find pharmacists within the radius
        const pharmacists = yield server_1.prisma.$queryRawUnsafe(`
      SELECT 
        id, 
        "firstName", 
        "lastName", 
        "phoneNumber", 
        "cvUrl", 
        bio, 
        experience, 
        education, 
        latitude, 
        longitude, 
        available,
        ST_Distance(
          ST_MakePoint(longitude, latitude)::geography, 
          ST_MakePoint(${Number(longitude)}, ${Number(latitude)})::geography
        ) / 1000 AS distance_km 
      FROM "PharmacistProfile" 
      WHERE ST_DWithin(
        ST_MakePoint(longitude, latitude)::geography, 
        ST_MakePoint(${Number(longitude)}, ${Number(latitude)})::geography, 
        ${searchRadius * 1000}
      ) ${availabilityFilter}
      ORDER BY distance_km ASC;
    `);
        return res.status(200).json({
            message: 'Pharmacists found',
            count: pharmacists.length,
            maxRadius,
            searchRadius,
            pharmacists
        });
    }
    catch (error) {
        console.error('Error searching pharmacists:', error);
        return res.status(500).json({ message: 'Server error while searching pharmacists' });
    }
});
exports.searchPharmacists = searchPharmacists;
// Upload CV for pharmacist
const uploadCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Create uploads directory if it doesn't exist
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'cvs');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        // Get file path
        const filePath = req.file.path;
        const fileUrl = `/uploads/cvs/${path_1.default.basename(filePath)}`;
        // Update pharmacist profile with CV URL
        const updatedProfile = yield server_1.prisma.pharmacistProfile.update({
            where: { userId },
            data: { cvUrl: fileUrl }
        });
        return res.status(200).json({
            message: 'CV uploaded successfully',
            cvUrl: updatedProfile.cvUrl
        });
    }
    catch (error) {
        console.error('Error uploading CV:', error);
        return res.status(500).json({ message: 'Server error while uploading CV' });
    }
});
exports.uploadCV = uploadCV;
