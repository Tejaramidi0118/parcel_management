import React, { useState, useEffect } from "react";
import { Plus, Package, MapPin, Store as StoreIcon, Trash2, Edit, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/api";

export default function StoreOwnerDashboard() {
    const { user, logout } = useAuth();
    const { toast } = useToast();

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [products, setProducts] = useState([]);

    // Location Data
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);

    // Store Form State
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [storeForm, setStoreForm] = useState({
        name: "",
        description: "",
        image_url: "",
        address_street: "",
        city_id: "",
        district_id: "",
        state_id: ""
    });

    // Product Form State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productForm, setProductForm] = useState({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        category: "General",
        image_url: ""
    });

    useEffect(() => {
        loadMyStores();
        loadStates();
    }, []);

    useEffect(() => {
        if (selectedStore) {
            loadProducts(selectedStore.store_id);
        }
    }, [selectedStore]);

    // Load Districts when State changes in Store Form
    useEffect(() => {
        if (storeForm.state_id) {
            loadDistricts(storeForm.state_id);
        } else {
            setDistricts([]);
        }
    }, [storeForm.state_id]);

    const loadMyStores = async () => {
        try {
            const res = await api.apiGetMyStores();
            if (res.success) {
                setStores(res.stores);
                if (res.stores.length > 0 && !selectedStore) {
                    setSelectedStore(res.stores[0]);
                }
            }
        } catch (error) {
            console.error("Failed to load stores", error);
        }
    };

    const loadStates = async () => {
        try {
            const res = await api.apiGetStates();
            if (res.success) setStates(res.states);
        } catch (error) {
            console.error("Failed to load states", error);
        }
    };

    const loadDistricts = async (stateId) => {
        try {
            const res = await api.apiGetDistricts(stateId);
            if (res.success) setDistricts(res.districts);
        } catch (error) {
            console.error("Failed to load districts", error);
        }
    };

    const loadProducts = async (storeId) => {
        try {
            const res = await api.apiGetStoreProducts(storeId);
            if (res.success) {
                setProducts(res.products || []);
            }
        } catch (error) {
            console.error("Failed to load products", error);
        }
    };

    const openCreateStore = () => {
        setStoreForm({
            name: "", description: "", image_url: "",
            address_street: "", city_id: "", district_id: "", state_id: ""
        });
        setIsEditMode(false);
        setIsStoreModalOpen(true);
    };

    const openEditStore = (store) => {
        setStoreForm({
            name: store.name,
            description: store.description || "",
            image_url: store.image_url || "",
            address_street: store.address_street || "",
            city_id: store.city_id || "",
            district_id: store.district_id?.toString() || "",
            state_id: store.state_id?.toString() || ""
        });
        setIsEditMode(true);
        setIsStoreModalOpen(true);
    };

    const handleSaveStore = async () => {
        try {
            const payload = {
                ...storeForm,
                district_id: parseInt(storeForm.district_id),
                state_id: parseInt(storeForm.state_id),
                city_id: storeForm.city_id ? parseInt(storeForm.city_id) : null,
                latitude: 17.0, longitude: 79.0 // Mock location for now
            };

            let res;
            if (isEditMode && selectedStore) {
                res = await api.apiUpdateStore(selectedStore.store_id, payload);
            } else {
                res = await api.apiCreateStore(payload);
            }

            if (res.success) {
                toast({ title: isEditMode ? "Store Updated" : "Store Created" });
                setIsStoreModalOpen(false);
                loadMyStores();
            }
        } catch (error) {
            toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
        }
    };

    const handleCreateProduct = async () => {
        if (!selectedStore) return;
        try {
            const payload = { ...productForm, store_id: selectedStore.store_id };
            const res = await api.apiCreateProduct(payload);

            if (res.success) {
                toast({ title: "Product Added" });
                setIsProductModalOpen(false);
                loadProducts(selectedStore.store_id);
                setProductForm({ name: "", description: "", price: "", stock_quantity: "", category: "General", image_url: "" });
            }
        } catch (error) {
            toast({ title: "Failed to add product", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Store Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Manage your digital storefronts and inventory</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium hidden sm:inline-block">Welcome, {user?.full_name}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar: Stores List */}
                <div className="space-y-6">
                    <Card className="h-full border-none shadow-md">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">My Stores</CardTitle>
                                <Button size="icon" variant="ghost" onClick={openCreateStore}>
                                    <Plus className="h-5 w-5 text-primary" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                            {stores.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    <StoreIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No stores yet.
                                </div>
                            ) : (
                                stores.map(store => (
                                    <div
                                        key={store.store_id}
                                        onClick={() => setSelectedStore(store)}
                                        className={`p-3 rounded-lg cursor-pointer flex items-start gap-3 transition-all ${selectedStore?.store_id === store.store_id ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted'}`}
                                    >
                                        <div className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 ${selectedStore?.store_id === store.store_id ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
                                            <StoreIcon className="h-5 w-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-semibold truncate leading-tight">{store.name}</p>
                                            <p className={`text-xs mt-1 truncate ${selectedStore?.store_id === store.store_id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                {store.city_name || 'No City'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content: Store Details & Products */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedStore ? (
                        <>
                            {/* Store Header Card */}
                            <Card className="border-none shadow-md overflow-hidden">
                                <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 relative">
                                    {selectedStore.image_url && (
                                        <img src={selectedStore.image_url} alt={selectedStore.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <Button size="sm" variant="secondary" onClick={() => openEditStore(selectedStore)}>
                                            <Edit className="h-4 w-4 mr-2" /> Edit Store
                                        </Button>
                                    </div>
                                </div>
                                <CardHeader className="relative -mt-12 pt-0 px-6 pb-6">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-end gap-4">
                                            <div className="h-24 w-24 rounded-xl border-4 border-background bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                                {selectedStore.image_url ? (
                                                    <img src={selectedStore.image_url} alt="Logo" className="h-full w-full object-cover" />
                                                ) : (
                                                    <StoreIcon className="h-10 w-10 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="mb-2">
                                                <CardTitle className="text-2xl">{selectedStore.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {selectedStore.address_street}, {selectedStore.district_name || selectedStore.city_name}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedStore.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {selectedStore.is_active ? 'Open' : 'Closed'}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedStore.description && (
                                        <p className="mt-4 text-sm text-muted-foreground max-w-3xl">
                                            {selectedStore.description}
                                        </p>
                                    )}
                                </CardHeader>
                            </Card>

                            {/* Products Grid */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Products</h2>
                                    <Button onClick={() => setIsProductModalOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Product
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map(prod => (
                                        <Card key={prod.product_id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="h-48 bg-muted relative overflow-hidden">
                                                {prod.image_url ? (
                                                    <img src={prod.image_url} alt={prod.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground/30">
                                                        <Package className="h-12 w-12" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                                                    {prod.category}
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold truncate flex-1 mr-2">{prod.name}</h3>
                                                    <p className="font-bold text-primary shrink-0">₹{prod.price}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">
                                                    {prod.description || "No description"}
                                                </p>
                                                <div className="flex justify-between items-center pt-2 border-t mt-2">
                                                    <div className={`text-xs px-2 py-0.5 rounded-full ${prod.stock_quantity > 0 ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'}`}>
                                                        {prod.stock_quantity > 0 ? `${prod.stock_quantity} in stock` : 'Out of Stock'}
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Edit className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {products.length === 0 && (
                                        <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
                                            <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                                            <h3 className="text-lg font-medium">No Products Yet</h3>
                                            <p className="text-muted-foreground text-sm mb-4">Start adding items to your store inventory</p>
                                            <Button variant="outline" onClick={() => setIsProductModalOpen(true)}>Add First Product</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
                            <StoreIcon className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a store to manage</p>
                            <p className="text-sm">Or create a new one to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Store Modal */}
            <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Edit Store Details" : "Create New Store"}</DialogTitle>
                        <DialogDescription>
                            Configure your digital storefront settings and location.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Store Name</Label>
                                <Input value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} placeholder="e.g. Fresh Mart" />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Description</Label>
                                <Textarea value={storeForm.description} onChange={e => setStoreForm({ ...storeForm, description: e.target.value })} placeholder="Best grocery store in town..." />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Image URL (Logo/Banner)</Label>
                                <div className="flex gap-2">
                                    <Input value={storeForm.image_url} onChange={e => setStoreForm({ ...storeForm, image_url: e.target.value })} placeholder="https://..." className="flex-1" />
                                    {storeForm.image_url && <img src={storeForm.image_url} className="h-10 w-10 rounded object-cover border" alt="Prev" />}
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="col-span-2 space-y-2 border-t pt-2 mt-2">
                                <Label className="text-base font-semibold">Location</Label>
                            </div>

                            <div className="space-y-2">
                                <Label>State</Label>
                                <Select value={storeForm.state_id} onValueChange={(val) => setStoreForm({ ...storeForm, state_id: val, district_id: "" })}>
                                    <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                                    <SelectContent>
                                        {states.map(s => <SelectItem key={s.state_id} value={s.state_id.toString()}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>District</Label>
                                <Select value={storeForm.district_id} onValueChange={(val) => setStoreForm({ ...storeForm, district_id: val })} disabled={!storeForm.state_id}>
                                    <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                                    <SelectContent>
                                        {districts.map(d => <SelectItem key={d.district_id} value={d.district_id.toString()}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label>Street Address</Label>
                                <Input value={storeForm.address_street} onChange={e => setStoreForm({ ...storeForm, address_street: e.target.value })} placeholder="Shop No. 5, Main Market" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStoreModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveStore}>{isEditMode ? "Save Changes" : "Create Store"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Product Modal */}
            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Product Name</Label>
                            <Input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Milk 1L" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Product details..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Price (₹)</Label>
                                <Input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Stock Quantity</Label>
                                <Input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })} placeholder="100" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} placeholder="Dairy, Snacks, etc" />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <div className="flex gap-2">
                                <Input value={productForm.image_url} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="https://..." />
                                {productForm.image_url && <img src={productForm.image_url} className="h-10 w-10 rounded border" alt="Preview" />}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateProduct}>Add Product</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
