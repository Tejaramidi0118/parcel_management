import { getNearestStores, getStoreProducts, getStoreById } from './store.service.js';

/**
 * GET /api/stores/nearby?lat=<>&lng=<>&radius=<>
 * Find nearest stores based on user location
 */
export async function getNearbyStores(req, res, next) {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates or radius',
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates out of valid range',
      });
    }

    const stores = await getNearestStores(latitude, longitude, radiusKm);

    return res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
      message: stores.length > 0
        ? `Found ${stores.length} store(s) nearby`
        : 'No stores found in your area',
    });
  } catch (error) {
    console.error('Get nearby stores error:', error);
    next(error);
  }
}

/**
 * GET /api/stores/:storeId
 * Get store details by ID
 */
export async function getStore(req, res, next) {
  try {
    const { storeId } = req.params;

    const store = await getStoreById(parseInt(storeId));

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error('Get store error:', error);
    next(error);
  }
}

/**
 * GET /api/stores/:storeId/products
 * Get available products at a specific store
 */
export async function getProductsByStore(req, res, next) {
  try {
    const { storeId } = req.params;

    const products = await getStoreProducts(parseInt(storeId));

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
      message: products.length > 0
        ? `${products.length} product(s) available at this store`
        : 'No products available at this store',
    });
  } catch (error) {
    console.error('Get products by store error:', error);
    next(error);
  }
}
