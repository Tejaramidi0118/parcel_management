// frontend/src/pages/customer/BookParcel.tsx
import React, {JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Scale, MapPin, ClipboardList, User, Phone, Home } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiCreateParcel } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

export default function BookParcel(): JSX.Element {
  const { user } = useAuth();
  const { cities } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    weight_kg: "",
    dimensions: "",
    delivery_city_id: "",
    recipient_name: "",
    recipient_phone: "",
    recipient_address_street: "",
    recipient_address_area: "",
    recipient_address_city: "",
    recipient_address_pincode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [expectedDate, setExpectedDate] = useState<string | null>(null);

  // Debug: Log cities
  React.useEffect(() => {
    console.log("BookParcel - Cities loaded:", cities.length, cities);
  }, [cities]);

  // Calculate fare and expected date when weight or delivery city changes
  React.useEffect(() => {
    const calculateEstimate = async () => {
      if (!formData.weight_kg || parseFloat(formData.weight_kg) <= 0 || !formData.delivery_city_id) {
        setEstimatedFare(null);
        setExpectedDate(null);
        return;
      }

      try {
        // Parse dimensions
        let length = 10, width = 10, height = 10;
        if (formData.dimensions) {
          const parts = formData.dimensions.toLowerCase().split(/[x×]/).map(s => parseFloat(s.trim()));
          if (parts.length === 3 && parts.every(p => !isNaN(p) && p > 0)) {
            length = parts[0];
            width = parts[1];
            height = parts[2];
          }
        }

        // Calculate fare
        const weight = parseFloat(formData.weight_kg);
        const baseFare = 50;
        const weightFare = weight * 10;
        const volume = length * width * height;
        const volumeFare = volume * 0.5;
        const fare = Math.max(baseFare + weightFare + volumeFare, 100);
        setEstimatedFare(Math.round(fare * 100) / 100);

        // Calculate expected delivery date (3-5 business days)
        const deliveryCity = cities.find(c => c.id === formData.delivery_city_id);
        const customerCity = cities.find(c => 
          user.address_city && c.name.toLowerCase().includes(user.address_city.toLowerCase())
        );
        
        // Simple date calculation: 3-5 days based on distance
        const days = deliveryCity && customerCity && deliveryCity.id !== customerCity.id ? 5 : 3;
        const expected = new Date();
        expected.setDate(expected.getDate() + days);
        setExpectedDate(expected.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
      } catch (error) {
        console.error("Failed to calculate estimate:", error);
      }
    };

    calculateEstimate();
  }, [formData.weight_kg, formData.dimensions, formData.delivery_city_id, cities, user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">You must be logged in as a customer to book a parcel.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.weight_kg || parseFloat(formData.weight_kg) <= 0) {
        toast({
          title: "Validation Error",
          description: "Weight must be greater than 0",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.delivery_city_id) {
        toast({
          title: "Validation Error",
          description: "Please select a delivery city",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.recipient_name || !formData.recipient_phone) {
        toast({
          title: "Validation Error",
          description: "Recipient name and phone are required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Ensure delivery_city_id is a valid number
      const deliveryCityId = parseInt(formData.delivery_city_id);
      if (isNaN(deliveryCityId) || deliveryCityId <= 0) {
        toast({
          title: "Validation Error",
          description: "Please select a valid delivery city",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        weight_kg: parseFloat(formData.weight_kg),
        dimensions: formData.dimensions || undefined,
        delivery_city_id: deliveryCityId,
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        recipient_address_street: formData.recipient_address_street || undefined,
        recipient_address_area: formData.recipient_address_area || undefined,
        recipient_address_city: formData.recipient_address_city || undefined,
        recipient_address_pincode: formData.recipient_address_pincode || undefined,
      };

      const res = await apiCreateParcel(payload);

      toast({
        title: "Parcel Booked",
        description: `Tracking code: ${res.parcel?.tracking_code ?? "generated"}`,
      });

      setTimeout(() => {
        navigate("/customer/dashboard");
      }, 600);
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description:
          error instanceof Error
            ? error.message
            : error?.toString?.() ?? "An error occurred while booking parcel",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get customer's city for pickup (from user's address)
  const customerCity = cities.find(c => 
    user.address_city && c.name.toLowerCase().includes(user.address_city.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-5 w-5" />
            Book a Parcel
          </CardTitle>
          <CardDescription>
            Enter shipment details. Your saved address will be used as the pickup address.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pickup Address (Read-only, from customer profile) */}
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <Label className="text-sm font-semibold">Pickup Address (Your Address)</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium">{user.name}</p>
                <p>{user.address || user.address_street || "No address saved"}</p>
                {user.address_city && <p>{user.address_city}</p>}
                {customerCity && (
                  <p className="text-xs text-muted-foreground">
                    City: {customerCity.name}, {customerCity.state}
                  </p>
                )}
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight_kg">Weight (kg) *</Label>
              <div className="relative">
                <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions (optional)</Label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dimensions"
                  name="dimensions"
                  type="text"
                  placeholder="e.g. 30x20x15 cm"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Delivery City - Required */}
            <div className="space-y-2">
              <Label htmlFor="delivery_city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery City *
              </Label>
              {cities.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 border rounded">
                  No cities available. Please add cities in admin panel or check backend connection.
                </div>
              ) : (
                <Select
                  value={formData.delivery_city_id || ""}
                  onValueChange={(value) => {
                    setFormData({ ...formData, delivery_city_id: value });
                  }}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select delivery city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}{city.state ? `, ${city.state}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Estimated Price and Delivery Date */}
            {(estimatedFare || expectedDate) && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Estimated Price:</span>
                  <span className="text-lg font-bold text-primary">₹{estimatedFare?.toFixed(2)}</span>
                </div>
                {expectedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Expected Delivery:</span>
                    <span className="text-sm font-semibold">{expectedDate}</span>
                  </div>
                )}
              </div>
            )}

            {/* Recipient Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Recipient Information *</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Recipient Name *
                  </Label>
                  <Input
                    id="recipient_name"
                    name="recipient_name"
                    value={formData.recipient_name}
                    onChange={handleChange}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient_phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Recipient Phone *
                  </Label>
                  <Input
                    id="recipient_phone"
                    name="recipient_phone"
                    type="tel"
                    value={formData.recipient_phone}
                    onChange={handleChange}
                    placeholder="+91-9876543210"
                    required
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <Label htmlFor="recipient_address_street" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Delivery Address
                </Label>
                <Input
                  id="recipient_address_street"
                  name="recipient_address_street"
                  value={formData.recipient_address_street}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient_address_area">Area / Locality</Label>
                  <Input
                    id="recipient_address_area"
                    name="recipient_address_area"
                    value={formData.recipient_address_area}
                    onChange={handleChange}
                    placeholder="Area or locality"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient_address_city">City</Label>
                  <Input
                    id="recipient_address_city"
                    name="recipient_address_city"
                    value={formData.recipient_address_city}
                    onChange={handleChange}
                    placeholder="City name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_address_pincode">Pincode</Label>
                <Input
                  id="recipient_address_pincode"
                  name="recipient_address_pincode"
                  value={formData.recipient_address_pincode}
                  onChange={handleChange}
                  placeholder="e.g. 560001"
                  maxLength={10}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Booking..." : "Book Parcel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
