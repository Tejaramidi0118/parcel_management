export const createOrderSchema = {
    body: {
        type: "object",
        required: ["storeId", "items"],
        properties: {
            storeId: { type: "string" },
            items: {
                type: "array",
                minItems: 1,
                items: {
                    type: "object",
                    required: ["productId", "quantity"],
                    properties: {
                        productId: { type: "string" },
                        quantity: { type: "integer", minimum: 1 }
                    }
                }
            }
        }
    }
};
