import React from "react";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart } from "lucide-react";

export default function Cart() {
    const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const deliveryFee = 25.00; // Formula can be added later (e.g., dist * 10)
    const grandTotal = cartTotal + deliveryFee;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
                    <div className="bg-gray-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/shop">
                        <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="md:col-span-2 space-y-4">
                        {cart.map(item => (
                            <Card key={item.product_id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex gap-4 items-center">
                                    <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                                        ) : (
                                            <ShoppingCart className="h-8 w-8 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{item.name}</h3>
                                        <p className="text-sm text-gray-500">₹{item.price}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.product_id, -1)}
                                                className="p-1 hover:bg-white rounded-md transition-colors"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, 1)}
                                                className="p-1 hover:bg-white rounded-md transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">₹{item.price * item.quantity}</p>
                                        <button
                                            onClick={() => removeFromCart(item.product_id)}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium mt-1 flex items-center justify-end gap-1"
                                        >
                                            <Trash2 className="h-3 w-3" /> Remove
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Bill Summary */}
                    <div className="md:col-span-1">
                        <Card className="sticky top-24 border-none shadow-lg">
                            <CardHeader className="bg-gray-50/50 border-b pb-4">
                                <CardTitle className="text-lg">Bill Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Item Total</span>
                                    <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between items-center">
                                    <span className="font-bold text-lg">To Pay</span>
                                    <span className="font-bold text-xl text-primary">₹{grandTotal.toFixed(2)}</span>
                                </div>

                                <Button className="w-full mt-4 font-bold h-12 text-base" onClick={() => navigate('/checkout')}>
                                    Proceed to Pay <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                                <div className="text-xs text-center text-muted-foreground mt-4">
                                    Safe and Secure Payments. 100% Authentic Products.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
