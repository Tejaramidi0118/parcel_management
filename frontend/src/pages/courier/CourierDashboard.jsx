import { Package, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/shared/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/api';
export default function CourierDashboard() {
    const { user } = useAuth();
    const { parcels, cities, hubs, updateParcel, addTrackingEvent, addAuditLog } = useData();
    const { toast } = useToast();
    // Backend already returns only assigned parcels for couriers, so use all parcels
    const assignedParcels = parcels;
    const pendingParcels = assignedParcels.filter((p) => p.status === 'at_hub' || p.status === 'picked_up');
    const inTransitParcels = assignedParcels.filter((p) => p.status === 'out_for_delivery');
    const deliveredParcels = assignedParcels.filter((p) => p.status === 'delivered');
    const getCityName = (cityId) => {
        return cities.find((c) => c.id === cityId)?.name || 'Unknown';
    };
    const getHubName = (hubId) => {
        const hub = hubs.find((h) => h.id === hubId);
        return hub ? hub.name : 'Unknown Hub';
    };
    const handleUpdateStatus = async (parcelId, newStatus) => {
        try {
            const apiAny = api;
            // Update status on backend
            await apiAny.apiUpdateParcelStatus(parcelId, newStatus, `Status updated by courier ${user?.name}`);
            // Update local state (await since it's now async)
            await updateParcel(parcelId, { status: newStatus });
            addTrackingEvent({
                parcelId,
                type: newStatus,
                timestamp: new Date().toISOString(),
                location: 'Current Location',
                actorId: user?.id,
                notes: `Status updated by courier ${user?.name}`,
            });
            addAuditLog({
                userId: user?.id || '',
                action: 'UPDATE',
                entityType: 'Parcel',
                entityId: parcelId,
                timestamp: new Date().toISOString(),
                details: `Updated parcel status to ${newStatus}`,
            });
            toast({
                title: 'Status Updated',
                description: `Parcel status updated to ${newStatus}`,
            });
        }
        catch (error) {
            console.error("Failed to update parcel status:", error);
            toast({
                title: 'Update Failed',
                description: error?.message || 'Failed to update parcel status',
                variant: 'destructive',
            });
        }
    };
    return (<div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Courier Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome, {user?.name}! Manage your assigned deliveries
          </p>
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
                Ready for pickup/delivery
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
                Out for delivery
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

        <Card>
          <CardHeader>
            <CardTitle>Assigned Deliveries</CardTitle>
            <CardDescription>
              Parcels assigned to you for delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedParcels.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                <p>No parcels assigned</p>
              </div>) : (<div className="space-y-4">
                {assignedParcels.map((parcel) => (<div key={parcel.id} className="p-4 border border-border rounded-lg">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-foreground">
                            {parcel.trackingCode}
                          </p>
                          <StatusBadge status={parcel.status}/>
                        </div>
                        <div className="space-y-2">
                          {/* Route with stops - Flipkart style */}
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-green-600"/>
                              <span className="font-semibold text-primary">
                                {getCityName(parcel.originCityId)}
                              </span>
                            </div>
                            <span className="text-muted-foreground">→</span>
                            {parcel.currentHubId && (<>
                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded">
                                  <span className="text-xs font-medium text-yellow-800">
                                    {getHubName(parcel.currentHubId)}
                                  </span>
                                </div>
                                <span className="text-muted-foreground">→</span>
                              </>)}
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-blue-600"/>
                              <span className="font-semibold text-primary">
                                {getCityName(parcel.destinationCityId)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <p>Recipient: {parcel.recipientName}</p>
                            <p>Phone: {parcel.recipientPhone}</p>
                            <p>Weight: {parcel.weight} kg</p>
                            <p>Status: {parcel.status}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Address: {parcel.recipientAddress}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {parcel.status === 'at_hub' && (<Button size="sm" onClick={() => handleUpdateStatus(parcel.id, 'out_for_delivery')}>
                            Mark Out for Delivery
                          </Button>)}
                        {parcel.status === 'out_for_delivery' && (<Button size="sm" onClick={() => handleUpdateStatus(parcel.id, 'delivered')}>
                            Mark as Delivered
                          </Button>)}
                      </div>
                    </div>
                  </div>))}
              </div>)}
          </CardContent>
        </Card>
      </div>
    </div>);
}
