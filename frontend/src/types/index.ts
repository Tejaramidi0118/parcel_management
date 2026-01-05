export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole = 'customer' | 'courier' | 'admin';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  vehicleId?: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface Hub {
  id: string;
  name: string;
  cityId: string;
  address: string;
  capacity: number;
  phone: string;
  email: string;
}

export interface Vehicle {
  id: string;
  courierId: string;
  licensePlate: string;
  type: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export type ParcelStatus = 'pending' | 'picked_up' | 'in_transit' | 'at_hub' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface ParcelItem {
  id: string;
  description: string;
  quantity: number;
  declaredValue: number;
}

export interface Parcel {
  id: string;
  trackingCode: string;
  senderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  originCityId: string;
  destinationCityId: string;
  currentHubId?: string;
  courierId?: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  status: ParcelStatus;
  items: ParcelItem[];
  fare: number;
  createdAt: string;
  deliveredAt?: string;
}

export type TrackingEventType = 'created' | 'picked_up' | 'arrived_at_hub' | 'departed_hub' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface TrackingEvent {
  id: string;
  parcelId: string;
  type: TrackingEventType;
  timestamp: string;
  location: string;
  actorId?: string;
  notes?: string;
  proof?: string;
}

export interface RoutePoint {
  id: string;
  parcelId: string;
  sequence: number;
  hubId: string;
  distance: number;
  estimatedTime: number;
}

export interface GraphNode {
  id: string;
  type: 'hub' | 'city';
  entityId: string;
}

export interface GraphEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distance: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details: string;
}
