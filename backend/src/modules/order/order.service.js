import pool from '../../config/db.config.js';
import { acquireLock, releaseLock, deleteCachePattern } from '../../config/redis.config.js';

/**
 * Create order with atomic inventory deduction
 * ACID transaction with row-level locking to prevent overselling
 * 
 * @param {Object} orderData - Order creation payload
 * @param {number} orderData.customerId - Customer user ID
 * @param {number} orderData.hubId - Store/hub ID
 * @param {Array} orderData.items - [{productId, quantity}]
 * @param {Object} orderData.delivery - Delivery address and location
 * @param {string} orderData.paymentMethod - Payment method
 * @returns {Promise<Object>} - Created order with items
 */
export async function createOrder(orderData) {
  const {
    customerId,
    hubId,
    items,
    delivery,
    paymentMethod = 'COD'
  } = orderData;

  const client = await pool.connect();
  const lockKey = `lock:inventory:hub:${hubId}`;
  let lockToken = null;

  try {
    // Step 1: Acquire distributed lock for this hub's inventory
    lockToken = await acquireLock(lockKey, 15); // 15 second lock
    if (!lockToken) {
      throw new Error('Unable to acquire inventory lock. Please try again.');
    }

    // Step 2: Begin PostgreSQL transaction
    await client.query('BEGIN');

    // Step 3: Lock inventory rows with SELECT FOR UPDATE
    const productIds = items.map(item => item.productId);
    const lockInventoryQuery = `
      SELECT 
        i.inventory_id,
        i.product_id,
        i.stock_quantity,
        i.reserved_quantity,
        p.base_price,
        p.name as product_name
      FROM inventory i
      INNER JOIN products p ON i.product_id = p.product_id
      WHERE 
        i.hub_id = $1 
        AND i.product_id = ANY($2)
        AND p.is_active = true
      FOR UPDATE -- Lock these rows until transaction completes
    `;

    const inventoryResult = await client.query(lockInventoryQuery, [hubId, productIds]);
    const inventoryMap = new Map(
      inventoryResult.rows.map(row => [row.product_id, row])
    );

    // Step 4: Validate stock availability
    const insufficientStock = [];
    let subtotal = 0;

    for (const item of items) {
      const inventory = inventoryMap.get(item.productId);

      if (!inventory) {
        throw new Error(`Product ${item.productId} not found at this store`);
      }

      const availableStock = inventory.stock_quantity - inventory.reserved_quantity;

      if (availableStock < item.quantity) {
        insufficientStock.push({
          productId: item.productId,
          productName: inventory.product_name,
          requested: item.quantity,
          available: availableStock
        });
      }

      subtotal += inventory.base_price * item.quantity;
    }

    if (insufficientStock.length > 0) {
      throw {
        code: 'INSUFFICIENT_STOCK',
        message: 'Some products are out of stock',
        details: insufficientStock
      };
    }

    // Step 5: Calculate total
    const deliveryFee = subtotal >= 200 ? 0 : 40; // Free delivery above ₹200
    const totalAmount = subtotal + deliveryFee;

    // Step 6: Create order record
    const createOrderQuery = `
      INSERT INTO orders (
        customer_id,
        hub_id,
        delivery_address_street,
        delivery_address_area,
        delivery_address_city,
        delivery_address_pincode,
        delivery_location,
        delivery_phone,
        subtotal,
        delivery_fee,
        total_amount,
        status,
        payment_method,
        payment_status,
        expected_delivery_time
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        ST_SetSRID(ST_MakePoint($7, $8), 4326),
        $9, $10, $11, $12, $13, $14, $15,
        NOW() + INTERVAL '30 minutes'
      )
      RETURNING 
        order_id,
        order_number,
        created_at,
        expected_delivery_time
    `;

    const orderResult = await client.query(createOrderQuery, [
      customerId,
      hubId,
      delivery.street,
      delivery.area,
      delivery.city,
      delivery.pincode,
      delivery.longitude,
      delivery.latitude,
      delivery.phone,
      subtotal,
      deliveryFee,
      totalAmount,
      'PENDING',
      paymentMethod,
      paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING'
    ]);

    const order = orderResult.rows[0];

    // Step 7: Insert order items
    const orderItemsQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
      VALUES ($1, $2, $3, $4)
    `;

    for (const item of items) {
      const inventory = inventoryMap.get(item.productId);
      await client.query(orderItemsQuery, [
        order.order_id,
        item.productId,
        item.quantity,
        inventory.base_price
      ]);
    }

    // Step 8: Deduct inventory (atomic)
    const deductInventoryQuery = `
      UPDATE inventory
      SET 
        stock_quantity = stock_quantity - $1,
        updated_at = NOW()
      WHERE hub_id = $2 AND product_id = $3
    `;

    for (const item of items) {
      await client.query(deductInventoryQuery, [
        item.quantity,
        hubId,
        item.productId
      ]);
    }

    // Step 9: Log initial order status
    await client.query(`
      INSERT INTO order_status_log (order_id, new_status, changed_by, notes)
      VALUES ($1, $2, $3, $4)
    `, [order.order_id, 'PENDING', customerId, 'Order created']);

    // Step 10: Commit transaction
    await client.query('COMMIT');

    // Step 11: Invalidate cache
    await deleteCachePattern(`products:hub:${hubId}`);
    await deleteCachePattern(`stores:nearby:*`);

    // Step 12: Fetch complete order with items
    const completeOrder = await getOrderById(order.order_id);

    // TODO: Push to delivery assignment queue (BullMQ)
    // await orderQueue.add('assign-delivery', { orderId: order.order_id });

    return completeOrder;

  } catch (error) {
    // Rollback on any error
    await client.query('ROLLBACK');
    console.error('Order creation error:', error);
    throw error;
  } finally {
    // Always release lock and connection
    if (lockToken) {
      await releaseLock(lockKey, lockToken);
    }
    client.release();
  }
}

/**
 * Get order by ID with full details
 * @param {number} orderId 
 */
export async function getOrderById(orderId) {
  const query = `
    SELECT 
      o.*,
      u.full_name as customer_name,
      u.email as customer_email,
      h.name as store_name,
      json_agg(
        json_build_object(
          'product_id', oi.product_id,
          'product_name', p.name,
          'quantity', oi.quantity,
          'price_at_order', oi.price_at_order,
          'subtotal', oi.subtotal
        )
      ) as items
    FROM orders o
    JOIN app_user u ON o.customer_id = u.user_id
    JOIN hub h ON o.hub_id = h.hub_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.product_id
    WHERE o.order_id = $1
    GROUP BY o.order_id, u.full_name, u.email, h.name
  `;

  const result = await pool.query(query, [orderId]);
  return result.rows[0] || null;
}

/**
 * Get orders for a customer
 * @param {number} customerId 
 */
export async function getCustomerOrders(customerId) {
  const query = `
    SELECT 
      o.order_id,
      o.order_number,
      o.created_at,
      o.status,
      o.total_amount,
      o.expected_delivery_time,
      h.name as store_name,
      COUNT(oi.order_item_id) as item_count
    FROM orders o
    JOIN hub h ON o.hub_id = h.hub_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.customer_id = $1
    GROUP BY o.order_id, h.name
    ORDER BY o.created_at DESC
  `;

  const result = await pool.query(query, [customerId]);
  return result.rows;
}

/**
 * Update order status
 * @param {number} orderId 
 * @param {string} newStatus 
 * @param {number} userId - User making the change
 */
export async function updateOrderStatus(orderId, newStatus, userId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get current status
    const currentOrder = await client.query(
      'SELECT status FROM orders WHERE order_id = $1',
      [orderId]
    );

    if (!currentOrder.rows[0]) {
      throw new Error('Order not found');
    }

    const oldStatus = currentOrder.rows[0].status;

    // Update order status
    const updateQuery = `
      UPDATE orders 
      SET 
        status = $1,
        updated_at = NOW(),
        ${newStatus === 'CONFIRMED' ? 'confirmed_at = NOW(),' : ''}
        ${newStatus === 'ASSIGNED' ? 'assigned_at = NOW(),' : ''}
        ${newStatus === 'PICKED_UP' ? 'picked_up_at = NOW(),' : ''}
        ${newStatus === 'DELIVERED' ? 'delivered_at = NOW(),' : ''}
        ${newStatus === 'CANCELLED' ? 'cancelled_at = NOW(),' : ''}
      WHERE order_id = $2
      RETURNING *
    `.replace(/,\s+WHERE/, ' WHERE'); // Clean up trailing commas

    await client.query(updateQuery, [newStatus, orderId]);

    // Log will be auto-created by trigger, but we can add manual notes
    await client.query(`
      INSERT INTO order_status_log (order_id, old_status, new_status, changed_by)
      VALUES ($1, $2, $3, $4)
    `, [orderId, oldStatus, newStatus, userId]);

    await client.query('COMMIT');

    return await getOrderById(orderId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
