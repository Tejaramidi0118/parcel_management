import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../../middlewares/validation.middleware.js';
import {
    createOrderController,
    getOrder,
    getCustomerOrdersController,
    updateOrderStatusController
} from './order.controller.js';

const router = Router();

/**
 * POST /api/orders
 * Create a new order
 */
router.post(
    '/',
    [
        body('customerId').isInt().withMessage('Valid customer ID required'),
        body('hubId').optional({ nullable: true }).isInt().withMessage('Valid hub ID required'),
        body('storeId').optional({ nullable: true }).isInt().withMessage('Valid store ID required'),
        body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
        body('items.*.productId').isInt().withMessage('Valid product ID required'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        body('delivery.street').notEmpty().withMessage('Street address required'),
        body('delivery.city').notEmpty().withMessage('City required'),
        body('delivery.pincode').notEmpty().withMessage('Pincode required'),
        body('delivery.latitude').isFloat().withMessage('Valid latitude required'),
        body('delivery.longitude').isFloat().withMessage('Valid longitude required'),
        body('delivery.phone').isMobilePhone().withMessage('Valid phone number required'),
        validate
    ],
    createOrderController
);

/**
 * GET /api/orders/:orderId
 * Get order details
 */
router.get('/:orderId', getOrder);

/**
 * GET /api/orders/customer/:customerId
 * Get customer order history
 */
router.get('/customer/:customerId', getCustomerOrdersController);

/**
 * PATCH /api/orders/:orderId/status
 * Update order status
 */
router.patch(
    '/:orderId/status',
    [
        body('status').notEmpty().withMessage('Status required'),
        body('userId').isInt().withMessage('Valid user ID required'),
        validate
    ],
    updateOrderStatusController
);

export default router;
