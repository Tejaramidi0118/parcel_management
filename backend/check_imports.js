
try {
    console.log("Checking parcel routes...");
    await import("./src/routes/parcel.routes.js");
    console.log("Parcel routes OK");

    console.log("Checking store routes...");
    await import("./src/routes/store.routes.js");
    console.log("Store routes OK");

    console.log("Checking product routes...");
    await import("./src/routes/product.routes.js");
    console.log("Product routes OK");

    console.log("Checking district routes...");
    await import("./src/routes/district.routes.js");
    console.log("District routes OK");

    console.log("Checking ALL routes...");
    await import("./src/app.js");
    console.log("App OK");

} catch (e) {
    console.error("ERROR IMPORTING:", e);
    console.error("Stack:", e.stack);
}
