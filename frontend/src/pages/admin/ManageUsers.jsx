import { Users, Plus } from 'lucide-react';
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
import * as api from '@/api';
export default function ManageUsers() {
  const { users } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
  });
  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
    });
    setIsDialogOpen(true);
  };
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      full_name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: '',
    });
    setIsDialogOpen(true);
  };
  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?'))
      return;
    try {
      const apiAny = api;
      await apiAny.apiDeleteUser(userId);
      toast({
        title: 'User Deleted',
        description: 'User has been deleted successfully',
      });
      // Reload page or refresh users list
      window.location.reload();
    }
    catch (error) {
      toast({
        title: 'Delete Failed',
        description: error?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiAny = api;
      if (editingUser) {
        // Update user
        await apiAny.apiUpdateUser(editingUser.id, {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        });
        toast({
          title: 'User Updated',
          description: 'User has been updated successfully',
        });
      }
      else {
        // Create user (signup)
        await apiAny.apiSignup({
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        toast({
          title: 'User Created',
          description: 'User has been created successfully',
        });
      }
      setIsDialogOpen(false);
      window.location.reload();
    }
    catch (error) {
      toast({
        title: editingUser ? 'Update Failed' : 'Create Failed',
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
            Manage Users
          </h1>
          <p className="text-muted-foreground">
            View and manage system users
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user information' : 'Create a new user account'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingUser && (<>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingUser} />
                </div>
              </>)}
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="courier">Courier</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="store_owner">Store Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>
            List of all registered users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (<TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin'
                      ? 'destructive'
                      : user.role === 'courier'
                        ? 'default'
                        : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
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
