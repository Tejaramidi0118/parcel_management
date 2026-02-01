import { createProduct, getStoreProducts } from "./product.service.js";

export const createProductController = async (req, res, next) => {
    try {
        const product = await createProduct(req.user.id, req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

export const getStoreProductsController = async (req, res, next) => {
    try {
        // Public or Protected? User app needs it. 
        // Usually Public. But if strict, only authenticated.
        // Let's assume Authenticated (USER/ADMIN).
        const { storeId } = req.params;
        const products = await getStoreProducts(storeId);
        res.json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};
