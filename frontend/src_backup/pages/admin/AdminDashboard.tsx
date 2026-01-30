import { Package, Users, Truck, Building2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { parcels, users, hubs, vehicles } = useData();

  const totalParcels = parcels.length;
  const activeParcels = parcels.filter((p) => p.status !== 'delivered' && p.status !== 'cancelled').length;
  const deliveredParcels = parcels.filter((p) => p.status === 'delivered').length;
  const totalUsers = users.length;
  const couriers = users.filter((u) => u.role === 'courier').length;
  const customers = users.filter((u) => u.role === 'customer').length;

  const recentParcels = parcels.slice(-5).reverse();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome, {user?.name}! Overview of system operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Parcels</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalParcels}</div>
              <p className="text-xs text-muted-foreground">
                {activeParcels} active, {deliveredParcels} delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {customers} customers, {couriers} couriers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hubs</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hubs.length}</div>
              <p className="text-xs text-muted-foreground">
                Active distribution centers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicles.length}</div>
              <p className="text-xs text-muted-foreground">
                Fleet vehicles available
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage system components
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link to="/admin/parcels">
                <Button variant="outline" className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Parcels
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/hubs">
                <Button variant="outline" className="w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Hubs
                </Button>
              </Link>
              <Link to="/admin/vehicles">
                <Button variant="outline" className="w-full">
                  <Truck className="h-4 w-4 mr-2" />
                  Manage Vehicles
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                System Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Delivery Success Rate</span>
                  <span className="text-sm font-semibold">
                    {totalParcels > 0 ? Math.round((deliveredParcels / totalParcels) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Deliveries</span>
                  <span className="text-sm font-semibold">{activeParcels}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Couriers</span>
                  <span className="text-sm font-semibold">{couriers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hub Capacity</span>
                  <span className="text-sm font-semibold">
                    {hubs.reduce((sum, h) => sum + h.capacity, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Parcels</CardTitle>
            <CardDescription>
              Latest parcel activities in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentParcels.map((parcel) => (
                <div
                  key={parcel.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {parcel.trackingCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {parcel.recipientName} • {parcel.weight} kg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">
                      {parcel.status.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{parcel.fare}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
