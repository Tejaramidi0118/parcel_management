import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Store as StoreIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MarketplaceHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAddresses();
    }, []);

    useEffect(() => {
        if (selectedAddressId) {
            const addr = addresses.find(a => a.address_id.toString() === selectedAddressId.toString());
            if (addr) {
                loadNearbyStores(addr.district_id, addr.city_id);
            }
        } else if (addresses.length > 0) {
            // Default to first address
            setSelectedAddressId(addresses[0].address_id.toString());
        }
    }, [selectedAddressId, addresses]);

    const loadAddresses = async () => {
        try {
            const res = await api.apiGetMyAddresses();
            if (res.success) {
                setAddresses(res.addresses);
            }
        } catch (error) {
            console.error("Failed to load addresses", error);
        }
    };

    const loadNearbyStores = async (districtId, cityId) => {
        setLoading(true);
        try {
            // Priority: District match
            const res = await api.apiGetNearbyStores({ district_id: districtId });
            if (res.success) {
                setStores(res.stores);
            }
        } catch (error) {
            console.error("Failed to load stores", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Hero / Address Bar */}
            <div className="bg-primary text-primary-foreground py-10 px-6 shadow-md rounded-b-[2rem] mb-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold mb-4">Groceries & More, Delivered in Minutes.</h1>
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                        <MapPin className="h-6 w-6 text-yellow-300" />
                        <div className="flex-1">
                            <label className="text-xs text-primary-foreground/70 block uppercase tracking-wider font-semibold">Delivering to</label>
                            {addresses.length > 0 ? (
                                <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                                    <SelectTrigger className="bg-transparent border-none text-white focus:ring-0 h-auto p-0 text-lg font-medium hover:text-yellow-100">
                                        <SelectValue placeholder="Select Address" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {addresses.map(addr => (
                                            <SelectItem key={addr.address_id} value={addr.address_id.toString()}>
                                                {addr.address_line_1}, {addr.district_name || addr.city_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Button variant="link" className="text-white p-0 h-auto font-medium" onClick={() => navigate('/profile')}>
                                    + Add an address to start shopping
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stores Grid */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Stores Near You</h2>
                    <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>)}
                    </div>
                ) : stores.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stores.map(store => (
                            <Card key={store.store_id} className="hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border-none shadow-md" onClick={() => navigate(`/store/${store.store_id}`)}>
                                <div className="h-40 bg-gray-100 relative overflow-hidden">
                                    {store.image_url ? (
                                        <img src={store.image_url} alt={store.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <StoreIcon className="h-12 w-12" />
                                        </div>
                                    )}
                                    {!store.is_active && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Closed</span>
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg mb-1">{store.name}</CardTitle>
                                            <CardDescription className="line-clamp-1">{store.address_street}, {store.city_name}</CardDescription>
                                        </div>
                                        {store.rating > 0 && (
                                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                                {store.rating} ★
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm text-gray-500">
                                        <span>20 mins</span>
                                        <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                        <span>Delivery ₹25</span>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-dashed">
                        <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <StoreIcon className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-1">No stores found nearby</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">We couldn't find any stores delivering to your selected location. Try changing your address or checking back later.</p>
                        <Button onClick={() => navigate('/profile')}>Manage Addresses</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
