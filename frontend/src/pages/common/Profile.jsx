import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, MapPin, Package, AlertTriangle, ArrowLeft } from "lucide-react";
import * as api from "@/api";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "@/components/shared/StatusBadge";

export default function Profile() {
    const { user } = useAuth();
    const { parcels, cities } = useData();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState(null); // 'orders', 'security', 'address', 'profile'

    // --- SECTION: YOUR ORDERS ---
    const userParcels = parcels.filter((p) => p.senderId === user?.id);
    const getCityName = (cityId) => cities.find((c) => c.id === cityId)?.name || 'Unknown';

    // --- SECTION: LOGIN & SECURITY ---
    const [passwordData, setPasswordData] = useState({ old: "", new: "", confirm: "" });
    const [passLoading, setPassLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            toast({ title: "Passwords match failed", description: "New password and confirm password do not match", variant: "destructive" });
            return;
        }
        setPassLoading(true);
        try {
            await api.apiChangePassword(passwordData.old, passwordData.new);
            toast({ title: "Password Updated", description: "Your password has been changed successfully." });
            setPasswordData({ old: "", new: "", confirm: "" });
            setActiveSection(null);
        } catch (err) {
            toast({ title: "Update Failed", description: err.message || "Could not update password", variant: "destructive" });
        } finally {
            setPassLoading(false);
        }
    };

    // --- SECTION: ADDRESSES ---
    const [addresses, setAddresses] = useState([]);
    const [showAddressDialog, setShowAddressDialog] = useState(false);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [newAddress, setNewAddress] = useState({
        type: 'Home', full_name: '', phone: '', street: '', city_id: '',
        state_id: '', district_id: '', zip_code: '', is_default: false
    });

    useEffect(() => {
        if (activeSection === 'address') {
            loadAddresses();
            loadStates();
        }
    }, [activeSection]);

    const loadAddresses = async () => {
        try {
            const res = await api.apiGetMyAddresses();
            if (res.success) setAddresses(res.addresses);
        } catch (e) {
            console.error(e);
        }
    };

    const loadStates = async () => {
        const res = await api.apiGetStates();
        if (res.success) setStates(res.states);
    };

    useEffect(() => {
        if (newAddress.state_id) {
            api.apiGetDistricts(newAddress.state_id).then(res => res.success && setDistricts(res.districts));
        } else {
            setDistricts([]);
        }
    }, [newAddress.state_id]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await api.apiAddAddress({
                ...newAddress,
                state_id: parseInt(newAddress.state_id),
                district_id: parseInt(newAddress.district_id)
            });
            toast({ title: "Address Added" });
            setShowAddressDialog(false);
            loadAddresses();
        } catch (err) {
            toast({ title: "Failed", description: err.message, variant: "destructive" });
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm("Delete this address?")) return;
        try {
            await api.apiDeleteAddress(id);
            toast({ title: "Address Deleted" });
            loadAddresses();
        } catch (error) {
            toast({ title: "Delete Failed", variant: "destructive" });
        }
    };

    // --- SECTION: PERSONAL PROFILE ---
    const [profileData, setProfileData] = useState({ full_name: "", email: "", phone: "" });
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        if (user) setProfileData({ full_name: user.name || user.full_name || "", email: user.email || "", phone: user.phone || "" });
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            await api.apiUpdateUser(user.id, profileData);
            toast({ title: "Profile Updated" });
            setActiveSection(null);
            window.location.reload();
        } catch (err) {
            toast({ title: "Failed", description: err.message, variant: "destructive" });
        } finally {
            setProfileLoading(false);
        }
    };


    // --- RENDER HELPERS ---
    const renderCard = (title, icon, desc, section) => (
        <Card className="hover:bg-muted/50 cursor-pointer transition-all hover:shadow-md" onClick={() => setActiveSection(section)}>
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    {icon}
                </div>
                <div>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription>{desc}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );

    if (!user) return null;

    if (activeSection) {
        return (
            <div className="min-h-screen py-8 bg-gray-50/50">
                <div className="max-w-4xl mx-auto px-4">
                    <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => setActiveSection(null)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Your Account
                    </Button>

                    {activeSection === 'orders' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Orders</CardTitle>
                                <CardDescription>Track, return, or buy things again</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userParcels.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No orders found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {userParcels.map(p => (
                                            <div key={p.id} className="border p-4 rounded-lg flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold">{p.trackingCode}</p>
                                                    <p className="text-sm text-gray-500">{getCityName(p.originCityId)} → {getCityName(p.destinationCityId)}</p>
                                                    <StatusBadge status={p.status} />
                                                </div>
                                                <Link to={`/customer/tracking?code=${p.trackingCode}`}>
                                                    <Button variant="outline" size="sm">Track</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'security' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Login & Security</CardTitle>
                                <CardDescription>Edit login, name, and mobile number</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <Input type="password" value={passwordData.old} onChange={e => setPasswordData({ ...passwordData, old: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input type="password" value={passwordData.new} onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Re-enter New Password</Label>
                                        <Input type="password" value={passwordData.confirm} onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} required />
                                    </div>
                                    <Button type="submit" disabled={passLoading}>{passLoading ? "Updating..." : "Save Changes"}</Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === 'address' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Your Addresses</h2>
                                <Button onClick={() => setShowAddressDialog(true)}>Add Address</Button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {addresses.map(addr => (
                                    <Card key={addr.address_id} className="relative">
                                        <CardContent className="pt-6">
                                            <div className="absolute top-4 right-4 cursor-pointer text-red-500 hover:text-red-700" onClick={() => handleDeleteAddress(addr.address_id)}>
                                                <AlertTriangle className="h-4 w-4" />
                                            </div>
                                            <p className="font-bold">{addr.type} {addr.is_default && "(Default)"}</p>
                                            <p className="text-sm mt-2">{addr.full_name}</p>
                                            <p className="text-sm text-gray-500">{addr.street}, {addr.district_name}, {addr.state_name} - {addr.zip_code}</p>
                                            <p className="text-sm text-gray-500">Ph: {addr.phone}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {/* Add Address Dialog - Simplified inline reuse or make component */}
                            {showAddressDialog && (
                                <Card className="mt-4 border-2 border-primary/20">
                                    <CardHeader>
                                        <CardTitle>Add New Address</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleAddAddress} className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <Label>Type (Home/Work)</Label>
                                                <Input value={newAddress.type} onChange={e => setNewAddress({ ...newAddress, type: e.target.value })} />
                                            </div>
                                            <div>
                                                <Label>State</Label>
                                                <select className="flex h-10 w-full rounded-md border bg-background px-3" value={newAddress.state_id} onChange={e => setNewAddress({ ...newAddress, state_id: e.target.value })} required>
                                                    <option value="">Select</option>
                                                    {states.map(s => <option key={s.state_id} value={s.state_id}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <Label>District</Label>
                                                <select className="flex h-10 w-full rounded-md border bg-background px-3" value={newAddress.district_id} onChange={e => setNewAddress({ ...newAddress, district_id: e.target.value })} required disabled={!newAddress.state_id}>
                                                    <option value="">Select</option>
                                                    {districts.map(d => <option key={d.district_id} value={d.district_id}>{d.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <Label>Street Address</Label>
                                                <Input value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                                            </div>
                                            <div>
                                                <Label>Pincode</Label>
                                                <Input value={newAddress.zip_code} onChange={e => setNewAddress({ ...newAddress, zip_code: e.target.value })} />
                                            </div>
                                            <div className="col-span-2 flex justify-end gap-2">
                                                <Button type="button" variant="outline" onClick={() => setShowAddressDialog(false)}>Cancel</Button>
                                                <Button type="submit">Save Address</Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {activeSection === 'profile' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Details</CardTitle>
                                <CardDescription>Update your public profile information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                                    <div><Label>Name</Label><Input value={profileData.full_name} onChange={e => setProfileData({ ...profileData, full_name: e.target.value })} /></div>
                                    <div><Label>Email</Label><Input value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} disabled /></div>
                                    <div><Label>Phone</Label><Input value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} /></div>
                                    <Button type="submit" disabled={profileLoading}>Save</Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 bg-white">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-3xl font-light mb-8">Your Account</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderCard("Your Orders", <Package className="h-8 w-8 text-orange-500" />, "Track, return, or buy things again", "orders")}
                    {renderCard("Login & Security", <Lock className="h-8 w-8 text-orange-500" />, "Edit login, name, and mobile number", "security")}
                    {renderCard("Your Addresses", <MapPin className="h-8 w-8 text-orange-500" />, "Edit addresses for orders and gifts", "address")}
                    {renderCard("Profile", <User className="h-8 w-8 text-orange-500" />, "Manage your user profile details", "profile")}
                </div>
            </div>
        </div>
    );
}
