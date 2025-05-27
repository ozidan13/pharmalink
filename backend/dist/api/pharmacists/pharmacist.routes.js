"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pharmacist_controller_1 = require("./pharmacist.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const pharmacist_validator_1 = require("./pharmacist.validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Configure multer for CV uploads
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/cvs');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (_req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
});
// Pharmacist routes (protected by authentication)
router.get('/me', auth_middleware_1.authenticate, auth_middleware_1.isPharmacist, pharmacist_controller_1.getProfile);
router.put('/me', auth_middleware_1.authenticate, auth_middleware_1.isPharmacist, pharmacist_validator_1.validateUpdateProfile, pharmacist_controller_1.updateProfile);
router.post('/me/cv', auth_middleware_1.authenticate, auth_middleware_1.isPharmacist, upload.single('cv'), pharmacist_controller_1.uploadCV);
// Routes for pharmacy owners
router.get('/search', auth_middleware_1.authenticate, auth_middleware_1.isPharmacyOwner, pharmacist_validator_1.validateSearchParams, pharmacist_controller_1.searchPharmacists);
router.get('/:id', auth_middleware_1.authenticate, auth_middleware_1.isPharmacyOwner, pharmacist_controller_1.getPharmacistById);
exports.default = router;
