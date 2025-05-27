"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_controller_1 = require("./store.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const store_validator_1 = require("./store.validator");
const store_search_validator_1 = require("./store.search.validator");
const router = (0, express_1.Router)();
// Product routes for pharmacy owners
router.post('/products', auth_middleware_1.authenticate, auth_middleware_1.isPharmacyOwner, store_validator_1.validateCreateProduct, store_controller_1.createProduct);
router.get('/products/my-products', auth_middleware_1.authenticate, auth_middleware_1.isPharmacyOwner, store_controller_1.getMyProducts);
router.get('/products/:id', auth_middleware_1.authenticate, store_controller_1.getProductById);
router.put('/products/:id', auth_middleware_1.authenticate, auth_middleware_1.isPharmacyOwner, store_validator_1.validateUpdateProduct, store_controller_1.updateProduct);
router.delete('/products/:id', auth_middleware_1.authenticate, auth_middleware_1.isPharmacyOwner, store_controller_1.deleteProduct);
// Public routes
router.get('/products', store_controller_1.getAllProducts);
router.get('/products/search', store_search_validator_1.validateSearchParams, store_controller_1.searchProducts);
exports.default = router;
