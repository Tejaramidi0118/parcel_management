export const createProductSchema = {
    body: {
        type: "object",
        required: ["name", "storeId", "category", "unit", "sellingPrice"], // sellingPrice needed for initial inventory setup? Or Product catalog doesn't have price?
        // Prompt 5.3 says: Product responsibilities: ... price, MRP.
        // Prompt 5.4 says: Inventory ... sellingPrice.
        // Separation: "Price can change without stock change"
        // Usually Base Price is in Product, Selling Price in Inventory?
        // "Product visibility controlled by store... Product responsibilities: name... price"
        // Ok, I will add price to Product validation.
        properties: {
            name: { type: "string", minLength: 3 },
            storeId: { type: "string" },
            category: { type: "string" },
            unit: { type: "string" }, // kg, gm, piece
            brand: { type: "string" },
            imageUrl: { type: "string" },
            price: { type: "number" }, // Base Price / MRP
        }
    }
};
