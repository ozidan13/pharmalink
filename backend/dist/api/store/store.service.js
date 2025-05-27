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
exports.searchProductsService = void 0;
const server_1 = require("../../server");
/**
 * Search for products based on various criteria
 */
const searchProductsService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ query, category, nearExpiry, minPrice, maxPrice, page = 1, limit = 10 }) {
    // Build filter
    const filter = {};
    // Text search on name and description
    if (query) {
        filter.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
        ];
    }
    // Category filter
    if (category) {
        filter.category = category;
    }
    // Near expiry filter
    if (nearExpiry) {
        filter.isNearExpiry = true;
    }
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) {
            filter.price.gte = minPrice;
        }
        if (maxPrice !== undefined) {
            filter.price.lte = maxPrice;
        }
    }
    // Calculate pagination
    const skip = (page - 1) * limit;
    // Execute query with pagination
    const [products, totalCount] = yield Promise.all([
        server_1.prisma.product.findMany({
            where: filter,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
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
        }),
        server_1.prisma.product.count({ where: filter })
    ]);
    return {
        products,
        pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit)
        }
    };
});
exports.searchProductsService = searchProductsService;
