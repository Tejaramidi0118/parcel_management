import { Package, Clock, CheckCircle2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/shared/StatusBadge';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
export default function CustomerDashboard() {
    const { user } = useAuth();
    const { parcels, cities } = useData();
    const [trackingCode, setTrackingCode] = useState('');
    const navigate = useNavigate(); // <-- added
    const userParcels = parcels.filter((p) => p.senderId === user?.id);
    const pendingParcels = userParcels.filter((p) => p.status === 'pending' || p.status === 'picked_up');
    const inTransitParcels = userParcels.filter((p) => p.status === 'in_transit' ||
        p.status === 'at_hub' ||
        p.status === 'out_for_delivery');
    const deliveredParcels = userParcels.filter((p) => p.status === 'delivered');
    const getCityName = (cityId) => {
        return cities.find((c) => c.id === cityId)?.name || 'Unknown';
    };
    const handleTrack = () => {
        if (trackingCode) {
            window.location.href = `/customer/tracking?code=${trackingCode}`;
        }
    };
    return (<div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header + Book button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-muted-foreground">
              Manage your parcels and track deliveries
            </p>
          </div>

          {/* New: Book Parcel button */}
          <Button className="self-start sm:self-auto" onClick={() => navigate('/customer/book')}>
            Book New Parcel
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingParcels.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting pickup or processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inTransitParcels.length}</div>
              <p className="text-xs text-muted-foreground">
                On the way to destination
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveredParcels.length}</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Track Your Parcel</CardTitle>
            <CardDescription>
              Enter your tracking code to see real-time updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="Enter tracking code (e.g., TRK1001234567)" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleTrack()}/>
              <Button onClick={handleTrack} className="gap-2">
                <Search className="h-4 w-4"/>
                Track
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Parcels</CardTitle>
            <CardDescription>
              Your recent shipments and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userParcels.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                <p>No parcels found</p>
              </div>) : (<div className="space-y-4">
                {userParcels.slice(0, 5).map((parcel) => (<div key={parcel.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 mb-2 sm:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">
                          {parcel.trackingCode}
                        </p>
                        <StatusBadge status={parcel.status}/>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getCityName(parcel.originCityId)} →{' '}
                        {getCityName(parcel.destinationCityId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        To: {parcel.recipientName}
                      </p>
                    </div>
                    <Link to={`/customer/tracking?code=${parcel.trackingCode}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>))}
              </div>)}
          </CardContent>
        </Card>
      </div>
    </div>);
}
