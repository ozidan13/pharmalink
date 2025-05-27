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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscription = exports.updateProfile = exports.getProfile = void 0;
const server_1 = require("../../server");
const express_validator_1 = require("express-validator");
// Get the current pharmacy owner's profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const profile = yield server_1.prisma.pharmacyOwnerProfile.findUnique({
            where: { userId },
            select: {
                id: true,
                pharmacyName: true,
                contactPerson: true,
                phoneNumber: true,
                address: true,
                latitude: true,
                longitude: true,
                subscriptionStatus: true,
                subscriptionExpiresAt: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!profile) {
            return res.status(404).json({ message: 'Pharmacy owner profile not found' });
        }
        return res.status(200).json(profile);
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ message: 'Server error while fetching profile' });
    }
});
exports.getProfile = getProfile;
// Update the current pharmacy owner's profile
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
        const { pharmacyName, contactPerson, phoneNumber, address, latitude, longitude } = req.body;
        // Update profile
        const updatedProfile = yield server_1.prisma.pharmacyOwnerProfile.update({
            where: { userId },
            data: {
                pharmacyName,
                contactPerson,
                phoneNumber,
                address,
                latitude,
                longitude
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
// Update subscription status
const updateSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { planType } = req.body;
        // Calculate expiration date (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        // Update subscription status
        const updatedProfile = yield server_1.prisma.pharmacyOwnerProfile.update({
            where: { userId },
            data: {
                subscriptionStatus: planType,
                subscriptionExpiresAt: expiresAt
            }
        });
        return res.status(200).json({
            message: 'Subscription updated successfully',
            subscription: {
                status: updatedProfile.subscriptionStatus,
                expiresAt: updatedProfile.subscriptionExpiresAt
            }
        });
    }
    catch (error) {
        console.error('Error updating subscription:', error);
        return res.status(500).json({ message: 'Server error while updating subscription' });
    }
});
exports.updateSubscription = updateSubscription;
