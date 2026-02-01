import prisma from "../../config/prisma.js";
import { verifyStoreOwner } from "../store/store.service.js";

/**
 * Add or Initialize Inventory for a Product
 */
export const addInventory = async (userId, data) => {
    // 1. Verify User owns the Store
    await verifyStoreOwner(userId, data.storeId);

    // 2. Create/Update Inventory
    return prisma.inventory.create({
        data: {
            storeId: data.storeId,
            productId: data.productId,
            availableStock: data.availableStock,
            reservedStock: 0,
            sellingPrice: data.sellingPrice,
            reorderLevel: data.reorderLevel
        }
    });
};

/**
 * Update Stock (Atomic Increment/Decrement)
 * Used by Admin to manually adjust stock.
 */
export const updateStock = async (userId, storeId, productId, delta) => {
    await verifyStoreOwner(userId, storeId);

    return prisma.inventory.update({
        where: {
            storeId_productId: { storeId, productId }
        },
        data: {
            availableStock: { increment: delta }
        }
    });
};

export const getStoreInventory = async (storeId) => {
    return prisma.inventory.findMany({
        where: { storeId },
        include: { product: true }
    });
};
