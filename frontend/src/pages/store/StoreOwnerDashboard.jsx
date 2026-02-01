import React, { useState, useEffect } from "react";
import { Plus, Package, MapPin, Store as StoreIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming exists or use Input
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Simple API helper if not in api.js yet
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function StoreOwnerDashboard() {
    const { user, token, logout } = useAuth();
    const { toast } = useToast();

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [districts, setDistricts] = useState([]); // Need to fetch districts for store creation

    // New Store Form
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [newStore, setNewStore] = useState({ name: "", address_street: "", city_id: "", district_id: "", state_id: "1" }); // Default state 1 (User said Telangana usually)

    // New Product Form
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", stock_quantity: "", category: "General", image_url: "" });

    useEffect(() => {
        fetchMyStores();
        fetchDistricts();
    }, [token]);

    useEffect(() => {
        if (selectedStore) {
            fetchProducts(selectedStore.store_id);
        }
    }, [selectedStore]);

    const apiHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    const fetchMyStores = async () => {
        try {
            const res = await fetch(`${API_BASE}/store/my`, { headers: apiHeaders });
            const data = await res.json();
            if (data.success) {
                setStores(data.stores);
                if (data.stores.length > 0 && !selectedStore) setSelectedStore(data.stores[0]);
            }
        } catch (err) {
            console.error("Failed to fetch stores", err);
        }
    };

    const fetchDistricts = async () => {
        try {
            const res = await fetch(`${API_BASE}/district?state_id=1`, { headers: apiHeaders }); // Hardcoded state 1 for now
            const data = await res.json();
            if (data.success) setDistricts(data.districts);
        } catch (err) {
            // quiet fail
        }
    };

    const fetchProducts = async (storeId) => {
        try {
            const res = await fetch(`${API_BASE}/product/store/${storeId}`, { headers: apiHeaders });
            const data = await res.json();
            if (data.success) setProducts(data.products);
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    const handleCreateStore = async () => {
        try {
            // Mock lat/long or get from city/address
            const payload = { ...newStore, latitude: 17.0, longitude: 79.0 };
            const res = await fetch(`${API_BASE}/store`, {
                method: "POST",
                headers: apiHeaders,
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Store Created", description: data.store.name });
                setIsStoreModalOpen(false);
                fetchMyStores();
            } else {
                toast({ title: "Error", description: data.message, variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to create store", variant: "destructive" });
        }
    };

    const handleCreateProduct = async () => {
        if (!selectedStore) return;
        try {
            const payload = { ...newProduct, store_id: selectedStore.store_id };
            const res = await fetch(`${API_BASE}/product`, {
                method: "POST",
                headers: apiHeaders,
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Product Added", description: data.product.name });
                setIsProductModalOpen(false);
                fetchProducts(selectedStore.store_id);
            } else {
                toast({ title: "Error", description: data.message, variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to add product", variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Store Dashboard</h1>
                    <p className="text-gray-500">Manage your stores and inventory</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-sm font-medium self-center mr-2">{user?.fullName}</span>
                    <Button variant="outline" onClick={logout}>Logout</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar: Stores List */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between items-center">
                                My Stores
                                <Button size="sm" variant="ghost" onClick={() => setIsStoreModalOpen(true)}><Plus className="h-4 w-4" /></Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {stores.map(store => (
                                <div
                                    key={store.store_id}
                                    onClick={() => setSelectedStore(store)}
                                    className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${selectedStore?.store_id === store.store_id ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                                >
                                    <StoreIcon className="h-5 w-5" />
                                    <div className="overflow-hidden">
                                        <p className="font-medium truncate">{store.name}</p>
                                        <p className="text-xs opacity-80 truncate">{store.city_name}</p>
                                    </div>
                                </div>
                            ))}
                            {stores.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No stores yet.</p>}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content: Products */}
                <div className="md:col-span-3">
                    {selectedStore ? (
                        <Card className="h-full min-h-[500px]">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>{selectedStore.name}</CardTitle>
                                        <CardDescription>{selectedStore.address_street}, {selectedStore.city_name}</CardDescription>
                                    </div>
                                    <Button onClick={() => setIsProductModalOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Product
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {products.map(prod => (
                                        <Card key={prod.product_id} className="overflow-hidden border shadow-sm">
                                            <div className="h-32 bg-gray-200 flex items-center justify-center text-gray-400">
                                                {prod.image_url ? <img src={prod.image_url} alt={prod.name} className="h-full w-full object-cover" /> : <Package className="h-10 w-10" />}
                                            </div>
                                            <div className="p-3">
                                                <h3 className="font-semibold truncate">{prod.name}</h3>
                                                <p className="text-sm text-gray-500 truncate">{prod.category}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="font-bold">₹{prod.price}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${prod.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {prod.stock_quantity > 0 ? `${prod.stock_quantity} left` : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                    {products.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">No products added yet.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 bg-white rounded-lg border border-dashed">
                            <p>Select or create a store to manage inventory</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Store Modal */}
            <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create New Store</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1"><Label>Store Name</Label><Input value={newStore.name} onChange={e => setNewStore({ ...newStore, name: e.target.value })} placeholder="My Supermarket" /></div>
                        <div className="space-y-1"><Label>Street Address</Label><Input value={newStore.address_street} onChange={e => setNewStore({ ...newStore, address_street: e.target.value })} /></div>

                        {/* District Selection */}
                        <div className="space-y-1">
                            <Label>District</Label>
                            <Select onValueChange={(val) => setNewStore({ ...newStore, district_id: val })}>
                                <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                                <SelectContent>
                                    {districts.map(d => <SelectItem key={d.district_id} value={d.district_id.toString()}>{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* City - Ideally filter based on district, but for now manual or simplified */}
                        <div className="space-y-1"><Label>City ID (Manual for now)</Label><Input value={newStore.city_id} onChange={e => setNewStore({ ...newStore, city_id: e.target.value })} placeholder="1, 2, etc" /></div>
                    </div>
                    <DialogFooter><Button onClick={handleCreateStore}>Create Store</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Product Modal */}
            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <Input className="col-span-3" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Price</Label>
                            <Input type="number" className="col-span-3" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Stock</Label>
                            <Input type="number" className="col-span-3" value={newProduct.stock_quantity} onChange={e => setNewProduct({ ...newProduct, stock_quantity: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Category</Label>
                            <Input className="col-span-3" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleCreateProduct}>Add Product</Button></DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
