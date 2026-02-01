import pool from '../../config/db.config.js';
import { getCache, setCache } from '../../config/redis.config.js';

/**
 * Find nearest stores/hubs within radius using PostGIS
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radiusKm - Search radius in kilometers (default: 10)
 * @param {number} limit - Max results (default: 10)
 * @returns {Promise<Array>} - Array of nearby stores with distance
 */
export async function getNearestStores(latitude, longitude, radiusKm = 10, limit = 10) {
  // Cache key based on location (rounded to 3 decimals for ~111m precision)
  const cacheKey = `stores:nearby:${latitude.toFixed(3)}:${longitude.toFixed(3)}:${radiusKm}`;

  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log('✅ Cache hit for nearest stores');
    return cached;
  }

  const radiusMeters = radiusKm * 1000;

  const query = `
    SELECT 
      h.hub_id as store_id,
      h.name as store_name,
      h.contact,
      h.capacity,
      h.radius_km,
      h.is_active,
      c.name as city_name,
      c.state_id,
      ST_X(h.location) as longitude,
      ST_Y(h.location) as latitude,
      ROUND(
        ST_Distance(
          h.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        )
      ) as distance_meters
    FROM hub h
    LEFT JOIN city c ON h.city_id = c.city_id
    WHERE 
      h.is_active = true
      AND h.location IS NOT NULL
      AND ST_DWithin(
        h.location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
    ORDER BY distance_meters ASC
    LIMIT $4
  `;

  try {
    const result = await pool.query(query, [longitude, latitude, radiusMeters, limit]);

    // Transform distance to km and add calculated delivery_possible flag
    const stores = result.rows.map(store => ({
      ...store,
      distance_km: (store.distance_meters / 1000).toFixed(2),
      delivery_possible: store.distance_meters <= (store.radius_km * 1000)
    }));

    // Cache for 60 seconds
    await setCache(cacheKey, stores, 60);

    return stores;
  } catch (error) {
    console.error('Error fetching nearest stores:', error);
    throw error;
  }
}

/**
 * Get products available at a specific store
 * @param {number} hubId - Store/hub ID
 * @returns {Promise<Array>} - Available products with stock info
 */
export async function getStoreProducts(hubId) {
  const cacheKey = `products:hub:${hubId}`;

  // Try cache
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log(`✅ Cache hit for store ${hubId} products`);
    return cached;
  }

  const query = `
    SELECT 
      p.product_id,
      p.name as product_name,
      p.description,
      p.category,
      p.base_price,
      p.unit,
      p.image_url,
      i.stock_quantity,
      i.reserved_quantity,
      (i.stock_quantity - i.reserved_quantity) as available_stock,
      CASE 
        WHEN (i.stock_quantity - i.reserved_quantity) > 0 THEN true
        ELSE false
      END as in_stock
    FROM products p
    INNER JOIN inventory i ON p.product_id = i.product_id
    WHERE 
      i.hub_id = $1
      AND p.is_active = true
      AND (i.stock_quantity - i.reserved_quantity) > 0
    ORDER BY p.category, p.name
  `;

  try {
    const result = await pool.query(query, [hubId]);

    // Cache for 30 seconds (shorter TTL as stock changes frequently)
    await setCache(cacheKey, result.rows, 30);

    return result.rows;
  } catch (error) {
    console.error(`Error fetching products for hub ${hubId}:`, error);
    throw error;
  }
}

/**
 * Get store details by ID
 * @param {number} hubId - Store/hub ID
 * @returns {Promise<Object>} - Store details
 */
export async function getStoreById(hubId) {
  const query = `
    SELECT 
      h.hub_id as store_id,
      h.name as store_name,
      h.contact,
      h.capacity,
      h.radius_km,
      h.is_active,
      c.name as city_name,
      c.state_id,
      ST_X(h.location) as longitude,
      ST_Y(h.location) as latitude
    FROM hub h
    LEFT JOIN city c ON h.city_id = c.city_id
    WHERE h.hub_id = $1
  `;

  try {
    const result = await pool.query(query, [hubId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching store ${hubId}:`, error);
    throw error;
  }
}
