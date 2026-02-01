export const createStoreSchema = {
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        minLength: 3,
        maxLength: 100
      }
    }
  }
};

export const updateStoreSchema = {
  body: {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 3,
        maxLength: 100
      },
      isActive: {
        type: "boolean"
      }
    }
  }
};
