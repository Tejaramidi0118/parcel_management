import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Shield } from 'lucide-react';
import * as api from '@/api';

export default function Profile() {
    const { user, login } = useAuth(); // login used to update context if needed
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                full_name: user.full_name || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    // Address State
    const { cities } = useData();
    const [addresses, setAddresses] = useState([]);
    const [showAddressDialog, setShowAddressDialog] = useState(false);

    // Cascading Dropdown State
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [newAddress, setNewAddress] = useState({
        type: 'Home',
        full_name: '',
        phone: '',
        street: '',
        city_id: '',
        state_id: '',
        district_id: '',
        zip_code: '',
        is_default: false
    });

    useEffect(() => {
        loadAddresses();
        loadStates();
    }, [user]);

    // Load Districts when State selection changes
    useEffect(() => {
        if (newAddress.state_id) {
            loadDistricts(newAddress.state_id);
        } else {
            setDistricts([]);
        }
    }, [newAddress.state_id]);

    const loadStates = async () => {
        try {
            const res = await api.apiGetStates();
            if (res.success) {
                setStates(res.states);
            }
        } catch (error) {
            console.error("Failed to load states", error);
        }
    }

    const loadDistricts = async (stateId) => {
        try {
            const res = await api.apiGetDistricts(stateId);
            if (res.success) {
                setDistricts(res.districts);
            }
        } catch (error) {
            console.error("Failed to load districts", error);
        }
    }

    const loadAddresses = async () => {
        try {
            const apiAny = api;
            const res = await apiAny.apiGetMyAddresses();
            if (res.success) {
                setAddresses(res.addresses);
            }
        } catch (error) {
            console.error("Failed to load addresses", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const apiAny = api;
            // Update user details
            const res = await apiAny.apiUpdateUser(user.id, {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                role: user.role // Keep existing role
            });

            if (res.success) {
                toast({
                    title: 'Profile Updated',
                    description: 'Your profile has been updated successfully.',
                });
                setIsEditing(false);
                // Ideally, we should update the auth context locally or re-fetch "me"
                // For now, we rely on the next page load or we can manually refresh if AuthContext supports it
                window.location.reload();
            }
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: error.message || 'Failed to update profile',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const apiAny = api;
            const res = await apiAny.apiAddAddress({
                ...newAddress,
                city_id: newAddress.city_id ? parseInt(newAddress.city_id) : null,
                state_id: newAddress.state_id ? parseInt(newAddress.state_id) : null,
                district_id: newAddress.district_id ? parseInt(newAddress.district_id) : null
            });
            if (res.success) {
                toast({ title: "Address Added" });
                setShowAddressDialog(false);
                loadAddresses();
                setNewAddress({
                    type: 'Home',
                    full_name: '',
                    phone: '',
                    street: '',
                    city_id: '',
                    state_id: '',
                    district_id: '',
                    zip_code: '',
                    is_default: false
                });
            }
        } catch (error) {
            toast({ title: "Failed to add address", subTitle: error.message, variant: "destructive" });
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm("Delete this address?")) return;
        try {
            const apiAny = api;
            await apiAny.apiDeleteAddress(id);
            toast({ title: "Address Deleted" });
            loadAddresses();
        } catch (error) {
            toast({ title: "Delete Failed", variant: "destructive" });
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen py-8 bg-muted/30">
            <div className="max-w-6xl mx-auto px-4 grid gap-6 md:grid-cols-2">
                {/* Profile Details */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-2xl">My Profile</CardTitle>
                        <CardDescription>Manage your personal information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">


                            {/* Editable Fields */}
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Phone
                                </Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                {isEditing ? (
                                    <>
                                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button type="button" onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Address Book */}
                <Card className="h-fit">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Address Book</CardTitle>
                            <CardDescription>Saved locations for quick booking</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => setShowAddressDialog(true)}>+ Add New</Button>
                    </CardHeader>
                    <CardContent>
                        {addresses.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No addresses saved yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {addresses.map(addr => (
                                    <div key={addr.address_id} className="border rounded-lg p-3 relative group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                        {addr.type}
                                                    </span>
                                                    {addr.is_default && <span className="text-xs text-muted-foreground">(Default)</span>}
                                                </div>
                                                <p className="font-medium text-sm">{addr.full_name || user.name}</p>
                                                <p className="text-sm text-muted-foreground">{addr.street}</p>
                                                <p className="text-sm text-foreground font-medium">
                                                    {addr.district_name ? `${addr.district_name}, ` : ''}
                                                    {addr.city_name ? `${addr.city_name}, ` : ''}
                                                    {addr.state_name} - {addr.zip_code}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">Ph: {addr.phone || user.phone}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => handleDeleteAddress(addr.address_id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add Address Dialog */}
                {showAddressDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-10">
                        <Card className="w-full max-w-lg mx-4">
                            <CardHeader>
                                <CardTitle>Add New Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddAddress} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <Label>Label (e.g. Home, Office)</Label>
                                            <Input value={newAddress.type} onChange={e => setNewAddress({ ...newAddress, type: e.target.value })} placeholder="Home, Work..." />
                                        </div>

                                        {/* State Selection */}
                                        <div>
                                            <Label>State</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newAddress.state_id}
                                                onChange={e => setNewAddress({ ...newAddress, state_id: e.target.value, district_id: '' })}
                                                required
                                            >
                                                <option value="">Select State</option>
                                                {states.map(s => <option key={s.state_id} value={s.state_id}>{s.name}</option>)}
                                            </select>
                                        </div>

                                        {/* District Selection */}
                                        <div>
                                            <Label>District</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newAddress.district_id}
                                                onChange={e => setNewAddress({ ...newAddress, district_id: e.target.value })}
                                                disabled={!newAddress.state_id}
                                                required
                                            >
                                                <option value="">Select District</option>
                                                {districts.map(d => <option key={d.district_id} value={d.district_id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* City is now optional/text or Major City Dropdown if needed, keeping simple for now */}
                                    {/* Maybe hide city dropdown if district is selected? Or keep it for major city specificity. 
                                        Let's keep it as optional 'Local Area' or verify if user wants only District. 
                                        For now I'll hide City ID or make it optional text if they want to be specific? 
                                        Actually, let's keep City Dropdown but make it optional, 
                                        OR remove it entirely in favor of strict State/District flow. 
                                        The user address table has city_id. 
                                        Let's rely on District for now as per user request for "states and districts".
                                    */}

                                    <div>
                                        <Label>Street Address (House No, Building, Area)</Label>
                                        <Input value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} placeholder="Block 12, Street 4" required />
                                    </div>

                                    <div>
                                        <Label>Pincode / Zip Code</Label>
                                        <Input value={newAddress.zip_code} onChange={e => setNewAddress({ ...newAddress, zip_code: e.target.value })} placeholder="500001" required />
                                    </div>

                                    <div className="flex justify-end gap-2 mt-4">
                                        <Button type="button" variant="outline" onClick={() => setShowAddressDialog(false)}>Cancel</Button>
                                        <Button type="submit">Save Address</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
