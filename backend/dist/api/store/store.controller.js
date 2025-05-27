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
exports.searchProducts = exports.getAllProducts = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getMyProducts = exports.createProduct = void 0;
const server_1 = require("../../server");
const express_validator_1 = require("express-validator");
const store_service_1 = require("./store.service");
// Create a new product
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Get pharmacy owner profile
        const pharmacyOwner = yield server_1.prisma.pharmacyOwnerProfile.findUnique({
            where: { userId }
        });
        if (!pharmacyOwner) {
            return res.status(404).json({ message: 'Pharmacy owner profile not found' });
        }
        const { name, description, price, category, isNearExpiry, expiryDate, imageUrl, stock } = req.body;
        // Create product
        const product = yield server_1.prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                category,
                isNearExpiry: isNearExpiry === true,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                imageUrl,
                stock: parseInt(stock, 10),
                pharmacyOwnerId: pharmacyOwner.id
            }
        });
        return res.status(201).json({
            message: 'Product created successfully',
            product
        });
    }
    catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({ message: 'Server error while creating product' });
    }
});
exports.createProduct = createProduct;
// Get all products for the current pharmacy owner
const getMyProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Get pharmacy owner profile
        const pharmacyOwner = yield server_1.prisma.pharmacyOwnerProfile.findUnique({
            where: { userId }
        });
        if (!pharmacyOwner) {
            return res.status(404).json({ message: 'Pharmacy owner profile not found' });
        }
        // Get products
        const products = yield server_1.prisma.product.findMany({
            where: { pharmacyOwnerId: pharmacyOwner.id },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({
            count: products.length,
            products
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ message: 'Server error while fetching products' });
    }
});
exports.getMyProducts = getMyProducts;
// Get a specific product by ID
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get product
        const product = yield server_1.prisma.product.findUnique({
            where: { id },
            include: {
                pharmacyOwner: {
                    select: {
                        pharmacyName: true,
                        contactPerson: true,
                        phoneNumber: true,
                        address: true,
                        latitude: true,
                        longitude: true
                    }
                }
            }
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ message: 'Server error while fetching product' });
    }
});
exports.getProductById = getProductById;
// Update a product
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Get pharmacy owner profile
        const pharmacyOwner = yield server_1.prisma.pharmacyOwnerProfile.findUnique({
            where: { userId }
        });
        if (!pharmacyOwner) {
            return res.status(404).json({ message: 'Pharmacy owner profile not found' });
        }
        // Check if product exists and belongs to this pharmacy owner
        const existingProduct = yield server_1.prisma.product.findFirst({
            where: {
                id,
                pharmacyOwnerId: pharmacyOwner.id
            }
        });
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found or you do not have permission to update it' });
        }
        const { name, description, price, category, isNearExpiry, expiryDate, imageUrl, stock } = req.body;
        // Update product
        const updatedProduct = yield server_1.prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: price !== undefined ? parseFloat(price) : undefined,
                category,
                isNearExpiry: isNearExpiry !== undefined ? isNearExpiry === true : undefined,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                imageUrl,
                stock: stock !== undefined ? parseInt(stock, 10) : undefined
            }
        });
        return res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct
        });
    }
    catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ message: 'Server error while updating product' });
    }
});
exports.updateProduct = updateProduct;
// Delete a product
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Get pharmacy owner profile
        const pharmacyOwner = yield server_1.prisma.pharmacyOwnerProfile.findUnique({
            where: { userId }
        });
        if (!pharmacyOwner) {
            return res.status(404).json({ message: 'Pharmacy owner profile not found' });
        }
        // Check if product exists and belongs to this pharmacy owner
        const existingProduct = yield server_1.prisma.product.findFirst({
            where: {
                id,
                pharmacyOwnerId: pharmacyOwner.id
            }
        });
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found or you do not have permission to delete it' });
        }
        // Delete product
        yield server_1.prisma.product.delete({
            where: { id }
        });
        return res.status(200).json({
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ message: 'Server error while deleting product' });
    }
});
exports.deleteProduct = deleteProduct;
// Get all products (public endpoint)
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, nearExpiry, page = '1', limit = '10' } = req.query;
        // Parse pagination parameters
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;
        // Build filter
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (nearExpiry === 'true') {
            filter.isNearExpiry = true;
        }
        // Get products with pagination
        const [products, totalCount] = yield Promise.all([
            server_1.prisma.product.findMany({
                where: filter,
                skip,
                take: limitNumber,
                orderBy: { createdAt: 'desc' },
                include: {
                    pharmacyOwner: {
                        select: {
                            pharmacyName: true,
                            contactPerson: true,
                            phoneNumber: true,
                            address: true
                        }
                    }
                }
            }),
            server_1.prisma.product.count({ where: filter })
        ]);
        return res.status(200).json({
            products,
            pagination: {
                total: totalCount,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(totalCount / limitNumber)
            }
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ message: 'Server error while fetching products' });
    }
});
exports.getAllProducts = getAllProducts;
// Search products with advanced filtering
const searchProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { q, // search query text
        category, // filter by category
        nearExpiry, // filter by near expiry status
        minPrice, // minimum price range
        maxPrice, // maximum price range
        page = '1', limit = '10' } = req.query;
        // Parse numeric parameters
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const minPriceValue = minPrice ? parseFloat(minPrice) : undefined;
        const maxPriceValue = maxPrice ? parseFloat(maxPrice) : undefined;
        // Call service function to perform search
        const result = yield (0, store_service_1.searchProductsService)({
            query: q,
            category: category,
            nearExpiry: nearExpiry === 'true',
            minPrice: minPriceValue,
            maxPrice: maxPriceValue,
            page: pageNumber,
            limit: limitNumber
        });
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('Error searching products:', error);
        return res.status(500).json({ message: 'Server error while searching products' });
    }
});
exports.searchProducts = searchProducts;
