import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Truck, CreditCard, Banknote, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/api";
import { useAuth } from "@/context/AuthContext";

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth(); // Get user for ID if needed, though backend uses token

    // Delivery Fee Logic (Should match Cart)
    const deliveryFee = 25.00;
    const grandTotal = cartTotal + deliveryFee;

    const [paymentMode, setPaymentMode] = useState("upi");
    const [isProcessing, setIsProcessing] = useState(false);

    // Address State
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [contactPhone, setContactPhone] = useState("");
    const [deliveryCity, setDeliveryCity] = useState("");

    // Helper to infer city
    const inferCity = (addr) => {
        if (addr.city_name) return addr.city_name;
        if (addr.district_name) return addr.district_name;
        // Try to extract from street if comma separated (e.g. "Street, City")
        if (addr.street && addr.street.includes(',')) {
            const parts = addr.street.split(',');
            return parts[parts.length - 1].trim();
        }
        return "";
    };

    useEffect(() => {
        const fetchAddresses = async () => {
            setLoadingAddresses(true);
            try {
                const res = await api.apiGetMyAddresses();
                if (res.success && Array.isArray(res.addresses)) {
                    setAddresses(res.addresses);
                    // Auto-select default
                    const def = res.addresses.find(a => a.is_default) || res.addresses[0];
                    if (def) {
                        setSelectedAddressId(def.address_id);
                        // Pre-fill fields
                        setContactPhone(def.phone || user?.phone || "");
                        setDeliveryCity(inferCity(def));
                    }
                }
            } catch (error) {
                console.error("Failed to load addresses", error);
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, [user]);

    // Update fields when address selection changes
    useEffect(() => {
        if (selectedAddressId) {
            const selectedAddr = addresses.find(a => a.address_id === parseInt(selectedAddressId));
            if (selectedAddr) {
                if (selectedAddr.phone) setContactPhone(selectedAddr.phone);
                else if (user?.phone && !contactPhone) setContactPhone(user.phone);

                setDeliveryCity(inferCity(selectedAddr));
            }
        }
    }, [selectedAddressId, addresses, user]);

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/shop');
        }
    }, [cart, navigate]);

    if (cart.length === 0) {
        return null;
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast({ title: "Address Required", description: "Please select a delivery address.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        try {
            const selectedAddr = addresses.find(a => a.address_id === parseInt(selectedAddressId));

            if (!deliveryCity) {
                toast({ title: "City Required", description: "Please enter your city.", variant: "destructive" });
                setIsProcessing(false);
                return;
            }

            if (!contactPhone) {
                toast({ title: "Phone Required", description: "Please enter a contact phone number.", variant: "destructive" });
                setIsProcessing(false);
                return;
            }

            // Create Order Payload correctly mapped for backend
            const orderPayload = {
                customerId: parseInt(user.id),
                storeId: cart[0].store_id, // Store Order
                items: cart.map(item => ({ productId: item.product_id, quantity: item.quantity })),
                paymentMethod: paymentMode.toUpperCase(),
                delivery: {
                    street: selectedAddr.street,
                    area: selectedAddr.district_name || selectedAddr.street,
                    city: deliveryCity,
                    pincode: selectedAddr.zip_code,
                    phone: contactPhone,
                    latitude: 0, // Geo-coding would go here, mock for now
                    longitude: 0
                }
            };

            // Call Backend
            await api.apiCreateOrder(orderPayload);

            // Success
            toast({
                title: "Order Placed Successfully!",
                description: `Your order of ₹${grandTotal.toFixed(2)} has been placed.`
            });
            clearCart();
            navigate('/customer/dashboard'); // Redirect to profile/dashboard where orders are listed

        } catch (error) {
            toast({ title: "Order Failed", description: error.message || "Something went wrong", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate('/cart')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cart
                </Button>
                <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

                <div className="grid gap-6">
                    {/* Address Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingAddresses ? (
                                <p>Loading addresses...</p>
                            ) : addresses.length === 0 ? (
                                <div className="text-center">
                                    <p className="text-muted-foreground mb-4">No addresses found.</p>
                                    <Button variant="outline" onClick={() => navigate('/profile')}>Add New Address</Button>
                                </div>
                            ) : (
                                <RadioGroup value={String(selectedAddressId)} onValueChange={setSelectedAddressId} className="space-y-4">
                                    {addresses.map((addr) => (
                                        <div key={addr.address_id} className={`flex items-start space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${String(selectedAddressId) === String(addr.address_id) ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-gray-50'}`}>
                                            <RadioGroupItem value={String(addr.address_id)} id={`addr-${addr.address_id}`} className="mt-1" />
                                            <Label htmlFor={`addr-${addr.address_id}`} className="flex-1 cursor-pointer">
                                                <div className="font-semibold">{addr.type} <span className="text-gray-500 font-normal">({addr.full_name})</span></div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {addr.street}, {addr.city_name}, {addr.state_name} - {addr.zip_code}
                                                </div>
                                                <div className="text-sm text-gray-600">Ph: {addr.phone}</div>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={paymentMode} onValueChange={setPaymentMode} className="space-y-4">
                                <div className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${paymentMode === 'upi' ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-gray-50'}`}>
                                    <RadioGroupItem value="upi" id="upi" />
                                    <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                                        <div className="bg-purple-100 p-2 rounded-full"><CreditCard className="h-5 w-5 text-purple-600" /></div>
                                        <div>
                                            <p className="font-semibold">UPI (PhonePe, GPay, Paytm)</p>
                                            <p className="text-xs text-gray-500">Fast & Secure</p>
                                        </div>
                                    </Label>
                                </div>

                                <div className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all ${paymentMode === 'cod' ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-gray-50'}`}>
                                    <RadioGroupItem value="cod" id="cod" />
                                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                                        <div className="bg-green-100 p-2 rounded-full"><Banknote className="h-5 w-5 text-green-600" /></div>
                                        <div>
                                            <p className="font-semibold">Cash on Delivery</p>
                                            <p className="text-xs text-gray-500">Pay when you receive</p>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Item Total ({cart.length} items)</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Delivery Fee</span>
                                <span>₹{deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                <span>Grand Total</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        size="lg"
                        className="w-full text-lg h-14 font-bold shadow-xl"
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Processing..." : `Pay ₹${grandTotal.toFixed(2)}`}
                    </Button>
                </div>
            </div>
        </div>
    );
}
