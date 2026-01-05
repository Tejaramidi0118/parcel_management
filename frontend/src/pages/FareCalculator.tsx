import { useState } from 'react';
import { Calculator, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/DataContext';

export default function FareCalculator() {
  const { cities } = useData();
  const [formData, setFormData] = useState({
    originCity: '',
    destinationCity: '',
    weight: '',
    serviceType: 'standard',
  });
  const [fare, setFare] = useState<number | null>(null);

  const calculateDistance = (city1Id: string, city2Id: string): number => {
    const city1 = cities.find((c) => c.id === city1Id);
    const city2 = cities.find((c) => c.id === city2Id);

    if (!city1 || !city2) return 0;

    const R = 6371;
    const dLat = ((city2.latitude - city1.latitude) * Math.PI) / 180;
    const dLon = ((city2.longitude - city1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((city1.latitude * Math.PI) / 180) *
        Math.cos((city2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCalculate = () => {
    const weight = Number.parseFloat(formData.weight);
    if (!formData.originCity || !formData.destinationCity || !weight) {
      return;
    }

    const distance = calculateDistance(formData.originCity, formData.destinationCity);
    
    let baseFare = 50;
    const distanceFare = distance * 0.5;
    const weightFare = weight * 20;
    
    let serviceMultiplier = 1;
    if (formData.serviceType === 'express') {
      serviceMultiplier = 1.5;
    } else if (formData.serviceType === 'international') {
      serviceMultiplier = 3;
    }

    const totalFare = (baseFare + distanceFare + weightFare) * serviceMultiplier;
    setFare(Math.round(totalFare));
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Fare Calculator</h1>
          <p className="text-xl text-muted-foreground">
            Calculate shipping costs for your parcels
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Fare
                </CardTitle>
                <CardDescription>
                  Enter your shipment details to get an instant quote
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="originCity">Origin City</Label>
                  <Select
                    value={formData.originCity}
                    onValueChange={(value) =>
                      setFormData({ ...formData, originCity: value })
                    }
                  >
                    <SelectTrigger id="originCity">
                      <SelectValue placeholder="Select origin city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}, {city.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="destinationCity">Destination City</Label>
                  <Select
                    value={formData.destinationCity}
                    onValueChange={(value) =>
                      setFormData({ ...formData, destinationCity: value })
                    }
                  >
                    <SelectTrigger id="destinationCity">
                      <SelectValue placeholder="Select destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}, {city.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Enter weight in kg"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, serviceType: value })
                    }
                  >
                    <SelectTrigger id="serviceType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Delivery</SelectItem>
                      <SelectItem value="express">Express Delivery</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCalculate} className="w-full">
                  Calculate Fare
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Estimated Fare
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fare !== null ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      Total Fare
                    </p>
                    <p className="text-4xl font-bold text-primary">₹{fare}</p>
                    <p className="text-xs text-muted-foreground mt-4">
                      * This is an estimated fare. Actual charges may vary based
                      on additional services and package dimensions.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter details to calculate fare</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Base fare: ₹50</p>
                <p>• Distance charge: ₹0.50/km</p>
                <p>• Weight charge: ₹20/kg</p>
                <p>• Express: 1.5x multiplier</p>
                <p>• International: 3x multiplier</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
