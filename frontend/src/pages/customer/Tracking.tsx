import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, MapPin, User, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/shared/StatusBadge';
import TrackingTimeline from '@/components/shared/TrackingTimeline';

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const [trackingCode, setTrackingCode] = useState(searchParams.get('code') || '');
  const [searchedCode, setSearchedCode] = useState(searchParams.get('code') || '');
  const { parcels, trackingEvents, cities, hubs } = useData();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setTrackingCode(code);
      setSearchedCode(code);
    }
  }, [searchParams]);

  const parcel = parcels.find((p) => p.trackingCode === searchedCode);
  const events = trackingEvents.filter((e) => e.parcelId === parcel?.id);

  const getCityName = (cityId: string) => {
    return cities.find((c) => c.id === cityId)?.name || 'Unknown';
  };

  const getHubName = (hubId?: string) => {
    if (!hubId) return 'N/A';
    return hubs.find((h) => h.id === hubId)?.name || 'Unknown';
  };

  const handleSearch = () => {
    setSearchedCode(trackingCode);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Track Your Parcel
          </h1>
          <p className="text-muted-foreground">
            Enter your tracking code to see real-time updates
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter tracking code (e.g., TRK1001234567)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                Track
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchedCode && !parcel && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No parcel found with tracking code: {searchedCode}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {parcel && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parcel Details</CardTitle>
                    <CardDescription>{parcel.trackingCode}</CardDescription>
                  </div>
                  <StatusBadge status={parcel.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Route Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Origin</p>
                        <p className="font-medium">
                          {getCityName(parcel.originCityId)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Destination</p>
                        <p className="font-medium">
                          {getCityName(parcel.destinationCityId)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Hub</p>
                        <p className="font-medium">
                          {getHubName(parcel.currentHubId)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Recipient Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{parcel.recipientName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{parcel.recipientPhone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Address</p>
                        <p className="font-medium">{parcel.recipientAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Package Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-medium">{parcel.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dimensions</p>
                        <p className="font-medium">
                          {parcel.length} × {parcel.width} × {parcel.height} cm
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fare</p>
                        <p className="font-medium">₹{parcel.fare}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">
                      Items
                    </h3>
                    <div className="space-y-2 text-sm">
                      {parcel.items.map((item) => (
                        <div key={item.id}>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-muted-foreground">
                            Qty: {item.quantity} | Value: ₹{item.declaredValue}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TrackingTimeline events={events} />
          </div>
        )}
      </div>
    </div>
  );
}
