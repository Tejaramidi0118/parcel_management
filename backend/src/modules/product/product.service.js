import pool from '../../config/db.config.js';

// TODO: Implement product CRUD with PostgreSQL pool
// For now, these are stubs to prevent import errors

export const createProduct = async (userId, data) => {
    throw new Error('Product creation not yet implemented');
};

export const getStoreProducts = async (storeId) => {
    // This functionality is now in store.service.js as getStoreProducts(hubId)
    throw new Error('Use /api/stores/:storeId/products endpoint instead');
};
