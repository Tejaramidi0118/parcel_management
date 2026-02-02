import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import * as api from "@/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Plus, Minus, ArrowLeft, Star, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function StorePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cart, updateQuantity, cartTotal, currentStoreId } = useCart();

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoreData();
    }, [id]);

    const loadStoreData = async () => {
        try {
            const [storeRes, prodRes] = await Promise.all([
                api.apiGetStore(id),
                api.apiGetStoreProducts(id)
            ]);

            if (storeRes.success) setStore(storeRes.store);
            if (prodRes.success) setProducts(prodRes.products || []);
        } catch (error) {
            console.error("Failed to load store", error);
            toast({ title: "Error", description: "Failed to load store details", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const getCartQuantity = (productId) => {
        const item = cart.find(i => i.product_id === productId);
        return item ? item.quantity : 0;
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
                </div>
            </div>
        );
    }

    if (!store) return <div className="p-10 text-center">Store not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Store Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="relative h-48 md:h-64 bg-gray-200">
                    {store.image_url && (
                        <img src={store.image_url} alt={store.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 mb-2 pl-0" onClick={() => navigate('/shop')}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
                        </Button>
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold">{store.name}</h1>
                                <p className="text-sm opacity-90">{store.address_street}, {store.city_name}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm font-medium">
                                    <span className="flex items-center bg-green-500 text-white px-2 py-0.5 rounded text-xs gap-1">
                                        {store.rating || "New"} <Star className="h-3 w-3 fill-current" />
                                    </span>
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 25 mins</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {store.description && (
                    <div className="p-4 md:px-6 text-sm text-gray-500 max-w-4xl">
                        {store.description}
                    </div>
                )}
            </div>

            {/* Products Grid */}
            <div className="container mx-auto p-4 md:p-6">
                <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(product => {
                        const qty = getCartQuantity(product.product_id);
                        return (
                            <Card key={product.product_id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-40 bg-gray-100 flex items-center justify-center p-4">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="h-full object-contain" />
                                    ) : (
                                        <div className="text-gray-300">No Image</div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                                        <span className="font-bold text-sm ml-2">₹{product.price}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {product.stock_quantity > 0
                                                ? (product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left!` : 'In Stock')
                                                : 'Out of Stock'}
                                        </span>
                                        {product.stock_quantity > 0 ? (
                                            qty === 0 ? (
                                                <Button
                                                    size="sm"
                                                    disabled={product.stock_quantity === 0}
                                                    onClick={() => addToCart(product, store.store_id)}
                                                >
                                                    Add
                                                </Button>
                                            ) : (
                                                <div className="flex items-center justify-between bg-green-50 rounded-md border border-green-200 px-2 py-1">
                                                    <button onClick={() => updateQuantity(product.product_id, -1)} className="p-1 hover:bg-green-100 rounded text-green-700 disabled:opacity-50">
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="font-bold text-sm text-green-800">{qty}</span>
                                                    <button onClick={() => updateQuantity(product.product_id, 1)} className="p-1 hover:bg-green-100 rounded text-green-700" disabled={qty >= product.stock_quantity}>
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )
                                        ) : (
                                            <Button disabled variant="secondary" className="w-full h-8 text-xs">Out of Stock</Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Float Cart Button */}
            {cart.length > 0 && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96">
                    <div className="bg-primary text-primary-foreground p-4 rounded-xl shadow-2xl flex justify-between items-center cursor-pointer hover:bg-primary/90 transition-colors"
                        onClick={() => navigate('/checkout')}>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">{cart.length} ITEMS</span>
                            <span className="text-xs opacity-80">From {store.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xl">₹{cartTotal}</span>
                            <div className="bg-white/20 p-2 rounded-full">
                                <ShoppingCart className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
