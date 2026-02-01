import { createOrder, getOrderById, getCustomerOrders, updateOrderStatus } from './order.service.js';

/**
 * POST /api/orders
 * Create a new order
 */
export async function createOrderController(req, res, next) {
    try {
        const orderData = req.body;
        const order = await createOrder(orderData);

        return res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully',
        });
    } catch (error) {
        if (error.code === 'INSUFFICIENT_STOCK') {
            return res.status(400).json({
                success: false,
                message: error.message,
                details: error.details,
            });
        }
        console.error('Create order error:', error);
        next(error);
    }
}

/**
 * GET /api/orders/:orderId
 * Get order details
 */
export async function getOrder(req, res, next) {
    try {
        const { orderId } = req.params;
        const order = await getOrderById(parseInt(orderId));

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Get order error:', error);
        next(error);
    }
}

/**
 * GET /api/orders/customer/:customerId
 * Get customer's order history
 */
export async function getCustomerOrdersController(req, res, next) {
    try {
        const { customerId } = req.params;
        const orders = await getCustomerOrders(parseInt(customerId));

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error('Get customer orders error:', error);
        next(error);
    }
}

/**
 * PATCH /api/orders/:orderId/status
 * Update order status
 */
export async function updateOrderStatusController(req, res, next) {
    try {
        const { orderId } = req.params;
        const { status, userId } = req.body;

        const order = await updateOrderStatus(parseInt(orderId), status, userId);

        return res.status(200).json({
            success: true,
            data: order,
            message: 'Order status updated',
        });
    } catch (error) {
        console.error('Update order status error:', error);
        next(error);
    }
}
