import { Truck, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export default function ManageVehicles() {
    const { vehicles, users, addVehicle, updateVehicle, deleteVehicle } = useData();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [formData, setFormData] = useState({
        licensePlate: '',
        courierId: '',
        capacity: '',
        status: 'idle',
        type: 'Van',
    });
    const getCourierName = (courierId) => {
        return users.find((u) => u.id === courierId)?.name || 'Unknown';
    };
    const couriers = users.filter(u => u.role === 'courier');
    const handleAdd = () => {
        setEditingVehicle(null);
        setFormData({
            licensePlate: '',
            courierId: '',
            capacity: '',
            status: 'idle',
            type: 'Van',
        });
        setIsDialogOpen(true);
    };
    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            licensePlate: vehicle.licensePlate,
            courierId: vehicle.courierId,
            capacity: String(vehicle.capacity),
            status: vehicle.status,
            type: vehicle.type,
        });
        setIsDialogOpen(true);
    };
    const handleDelete = async (vehicleId) => {
        if (!confirm('Are you sure you want to delete this vehicle?'))
            return;
        try {
            await deleteVehicle(vehicleId);
            toast({
                title: 'Vehicle Deleted',
                description: 'Vehicle has been deleted successfully',
            });
        }
        catch (error) {
            toast({
                title: 'Delete Failed',
                description: error?.message || 'Failed to delete vehicle',
                variant: 'destructive',
            });
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVehicle) {
                await updateVehicle(editingVehicle.id, {
                    licensePlate: formData.licensePlate,
                    courierId: formData.courierId,
                    capacity: parseInt(formData.capacity),
                    status: formData.status,
                });
                toast({
                    title: 'Vehicle Updated',
                    description: 'Vehicle has been updated successfully',
                });
            }
            else {
                await addVehicle({
                    licensePlate: formData.licensePlate,
                    courierId: formData.courierId,
                    capacity: parseInt(formData.capacity),
                    status: formData.status,
                    type: formData.type,
                });
                toast({
                    title: 'Vehicle Created',
                    description: 'Vehicle has been created successfully',
                });
            }
            setIsDialogOpen(false);
        }
        catch (error) {
            toast({
                title: editingVehicle ? 'Update Failed' : 'Create Failed',
                description: error?.message || 'Operation failed',
                variant: 'destructive',
            });
        }
    };
    return (<div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Manage Vehicles
            </h1>
            <p className="text-muted-foreground">
              View and manage fleet vehicles
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4"/>
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                <DialogDescription>
                  {editingVehicle ? 'Update vehicle information' : 'Add a new vehicle to the fleet'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input id="licensePlate" value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} required/>
                </div>
                <div>
                  <Label htmlFor="courierId">Assigned Courier</Label>
                  <Select value={formData.courierId} onValueChange={(value) => setFormData({ ...formData, courierId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select courier"/>
                    </SelectTrigger>
                    <SelectContent>
                      {couriers.map((courier) => (<SelectItem key={courier.id} value={courier.id}>
                          {courier.name} ({courier.username})
                        </SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity (kg)</Label>
                  <Input id="capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} required/>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="idle">Idle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingVehicle ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5"/>
              All Vehicles
            </CardTitle>
            <CardDescription>
              List of all vehicles in the fleet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Assigned Courier</TableHead>
                    <TableHead>Capacity (kg)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (<TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        {vehicle.licensePlate}
                      </TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{getCourierName(vehicle.courierId)}</TableCell>
                      <TableCell>{vehicle.capacity}</TableCell>
                      <TableCell>
                        <Badge variant={vehicle.status === 'active'
                ? 'default'
                : vehicle.status === 'maintenance'
                    ? 'secondary'
                    : 'destructive'}>
                          {vehicle.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(vehicle.id)}>
                            Delete
                          </Button>
                        </div>
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
