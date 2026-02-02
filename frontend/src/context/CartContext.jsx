import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { toast } = useToast();
    // Cart Item Structure: { product_id, store_id, name, price, quantity, image_url, ... }
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem("shopping_cart");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("shopping_cart", JSON.stringify(cart));
    }, [cart]);

    // Validation: Can only add items from the SAME store
    const addToCart = (product, storeId) => {
        setCart((prevCart) => {
            // Check if cart has items from another store
            if (prevCart.length > 0 && prevCart[0].store_id !== storeId) {
                // If diff store, we might want to prompt user (UI logic), but for context we'll error or replace?
                // For simplicity: Replace if user confirms (UI handled), or plain error.
                // Let's just return current cart and handle error in UI? 
                // Better: The context just throws or returns success:false?
                // Let's implement a 'clear and add' or 'error'. 
                // We'll throw an error effectively.
                toast({
                    title: "Different Store",
                    description: "You can only order from one store at a time. Clear cart to switch.",
                    variant: "destructive"
                });
                return prevCart;
            }

            const existing = prevCart.find(item => item.product_id === product.product_id);
            if (existing) {
                return prevCart.map(item =>
                    item.product_id === product.product_id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, { ...product, store_id: storeId, quantity: 1 }];
            }
        });
        if (cart.length === 0 || cart[0].store_id === storeId) {
            toast({ title: "Added to Cart" });
        }
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.product_id === productId) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const currentStoreId = cart.length > 0 ? cart[0].store_id : null;

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            currentStoreId
        }}>
            {children}
        </CartContext.Provider>
    );
};
