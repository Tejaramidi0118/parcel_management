import { addInventory, updateStock, getStoreInventory } from "./inventory.service.js";

export const addInventoryController = async (req, res, next) => {
    try {
        const result = await addInventory(req.user.id, req.body);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const updateStockController = async (req, res, next) => {
    try {
        const { storeId, productId } = req.params;
        const { delta } = req.body; // delta can be positive or negative
        const result = await updateStock(req.user.id, storeId, productId, delta);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

export const getInventoryController = async (req, res, next) => {
    try {
        const { storeId } = req.params;
        const result = await getStoreInventory(storeId);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};
