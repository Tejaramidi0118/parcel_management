import { Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import StatusBadge from '@/components/shared/StatusBadge';
export default function ManageParcels() {
    const { parcels, cities, users } = useData();
    const getCityName = (cityId) => {
        return cities.find((c) => c.id === cityId)?.name || 'Unknown';
    };
    const getUserName = (userId) => {
        return users.find((u) => u.id === userId)?.name || 'Unknown';
    };
    return (<div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Manage Parcels
          </h1>
          <p className="text-muted-foreground">
            View and manage all parcels in the system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5"/>
              All Parcels
            </CardTitle>
            <CardDescription>
              Complete list of all parcels and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Code</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcels.map((parcel) => (<TableRow key={parcel.id}>
                      <TableCell className="font-medium">
                        {parcel.trackingCode}
                      </TableCell>
                      <TableCell>{getUserName(parcel.senderId)}</TableCell>
                      <TableCell>{parcel.recipientName}</TableCell>
                      <TableCell>
                        {getCityName(parcel.originCityId)} →{' '}
                        {getCityName(parcel.destinationCityId)}
                      </TableCell>
                      <TableCell>{parcel.weight} kg</TableCell>
                      <TableCell>₹{parcel.fare}</TableCell>
                      <TableCell>
                        <StatusBadge status={parcel.status}/>
                      </TableCell>
                    </TableRow>))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
