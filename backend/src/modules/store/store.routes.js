import { Router } from 'express';
import { query } from 'express-validator';
import validate from '../../middlewares/validation.middleware.js';
import { getNearbyStores, getStore, getProductsByStore } from './store.controller.js';

const router = Router();

/**
 * GET /api/stores/nearby
 * Find nearest stores using PostGIS
 * Query params: lat, lng, radius (optional, default 10km)
 */
router.get(
  '/nearby',
  [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    query('radius').optional().isFloat({ min: 1, max: 50 }).withMessage('Radius must be between 1-50 km'),
    validate
  ],
  getNearbyStores
);

/**
 * GET /api/stores/:storeId
 * Get store details
 */
router.get('/:storeId', getStore);

/**
 * GET /api/stores/:storeId/products
 * Get products available at this store
 */
router.get('/:storeId/products', getProductsByStore);

export default router;
