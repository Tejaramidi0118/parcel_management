import { Building2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as api from '@/api';

export default function ManageHubs() {
  const { hubs, cities, addHub, updateHub, deleteHub } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    cityId: '',
    address: '',
    capacity: '',
    phone: '',
  });

  const getCityName = (cityId: string) => {
    return cities.find((c) => c.id === cityId)?.name || 'Unknown';
  };

  const handleAdd = () => {
    setEditingHub(null);
    setFormData({
      name: '',
      cityId: '',
      address: '',
      capacity: '',
      phone: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (hub: any) => {
    setEditingHub(hub);
    setFormData({
      name: hub.name,
      cityId: hub.cityId,
      address: hub.address,
      capacity: String(hub.capacity),
      phone: hub.phone,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (hubId: string) => {
    if (!confirm('Are you sure you want to delete this hub?')) return;

    try {
      await deleteHub(hubId);
      toast({
        title: 'Hub Deleted',
        description: 'Hub has been deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error?.message || 'Failed to delete hub',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHub) {
        await updateHub(editingHub.id, {
          name: formData.name,
          cityId: formData.cityId,
          address: formData.address,
          capacity: parseInt(formData.capacity),
          phone: formData.phone,
        });
        toast({
          title: 'Hub Updated',
          description: 'Hub has been updated successfully',
        });
      } else {
        await addHub({
          name: formData.name,
          cityId: formData.cityId,
          address: formData.address,
          capacity: parseInt(formData.capacity),
          phone: formData.phone,
          email: '',
        });
        toast({
          title: 'Hub Created',
          description: 'Hub has been created successfully',
        });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: editingHub ? 'Update Failed' : 'Create Failed',
        description: error?.message || 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Manage Hubs
            </h1>
            <p className="text-muted-foreground">
              View and manage distribution centers
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Add Hub
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingHub ? 'Edit Hub' : 'Add New Hub'}</DialogTitle>
                <DialogDescription>
                  {editingHub ? 'Update hub information' : 'Create a new distribution hub'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Hub Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cityId">City</Label>
                  <Select
                    value={formData.cityId}
                    onValueChange={(value) => setFormData({ ...formData, cityId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
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
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingHub ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              All Hubs
            </CardTitle>
            <CardDescription>
              List of all distribution centers and warehouses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hub Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hubs.map((hub) => (
                    <TableRow key={hub.id}>
                      <TableCell className="font-medium">{hub.name}</TableCell>
                      <TableCell>{getCityName(hub.cityId)}</TableCell>
                      <TableCell>{hub.address}</TableCell>
                      <TableCell>{hub.capacity.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{hub.phone}</p>
                          <p className="text-muted-foreground">{hub.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(hub)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(hub.id)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
