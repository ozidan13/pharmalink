import { Router } from 'express';
import { createProduct, getMyProducts, getProductById, updateProduct, deleteProduct, getAllProducts, searchProducts } from './store.controller';
import { authenticate, isPharmacyOwner } from '../../middleware/auth.middleware';
import { validateCreateProduct, validateUpdateProduct } from './store.validator';
import { validateSearchParams } from './store.search.validator';

const router = Router();

// Product routes for pharmacy owners
router.post('/products', authenticate, isPharmacyOwner, validateCreateProduct, createProduct);
router.get('/products/my-products', authenticate, isPharmacyOwner, getMyProducts);
router.get('/products/:id', authenticate, getProductById);
router.put('/products/:id', authenticate, isPharmacyOwner, validateUpdateProduct, updateProduct);
router.delete('/products/:id', authenticate, isPharmacyOwner, deleteProduct);

// Public routes
router.get('/products', getAllProducts);
router.get('/products/search', validateSearchParams, searchProducts);

export default router;