// Constants

export const PARCEL_STATUSES = {
  CREATED: 'created',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  AT_HUB: 'at_hub',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const TRACKING_EVENT_TYPES = {
  CREATED: 'created',
  PICKED_UP: 'picked_up',
  ARRIVED_AT_HUB: 'arrived_at_hub',
  DEPARTED_HUB: 'departed_hub',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const VEHICLE_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  IDLE: 'idle'
};

export const ROLES = {
  CUSTOMER: 'customer',
  COURIER: 'courier',
  ADMIN: 'admin'
};

export const VALID_STATUS_TRANSITIONS = {
  [PARCEL_STATUSES.CREATED]: [PARCEL_STATUSES.PICKED_UP, PARCEL_STATUSES.CANCELLED],
  [PARCEL_STATUSES.PICKED_UP]: [PARCEL_STATUSES.IN_TRANSIT, PARCEL_STATUSES.AT_HUB],
  [PARCEL_STATUSES.IN_TRANSIT]: [PARCEL_STATUSES.AT_HUB],
  [PARCEL_STATUSES.AT_HUB]: [PARCEL_STATUSES.DEPARTED_HUB, PARCEL_STATUSES.OUT_FOR_DELIVERY],
  [PARCEL_STATUSES.OUT_FOR_DELIVERY]: [PARCEL_STATUSES.DELIVERED],
  [PARCEL_STATUSES.DELIVERED]: [],
  [PARCEL_STATUSES.CANCELLED]: []
};

