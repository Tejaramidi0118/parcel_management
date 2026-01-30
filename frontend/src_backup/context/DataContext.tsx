import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  Parcel,
  TrackingEvent,
  Hub,
  Vehicle,
  AuditLog,
} from "@/types";

import { useAuth } from "@/context/AuthContext";

// JS API module imported as namespace (avoids TS named-export issues)
import * as api from "@/api";

import {
  trackingEvents as initialTrackingEvents,
  hubs as initialHubs,
  vehicles as initialVehicles,
  auditLogs as initialAuditLogs,
  cities,
  users,
} from "@/data/mockData";

interface DataContextType {
  parcels: Parcel[];
  trackingEvents: TrackingEvent[];
  hubs: Hub[];
  vehicles: Vehicle[];
  auditLogs: AuditLog[];
  cities: typeof cities;
  users: typeof users;

  updateParcel: (id: string, updates: Partial<Parcel>) => Promise<void>;
  addTrackingEvent: (event: Omit<TrackingEvent, "id">) => void;
  addAuditLog: (log: Omit<AuditLog, "id">) => void;

  updateHub: (id: string, updates: Partial<Hub>) => void;
  addHub: (hub: Omit<Hub, "id">) => void;
  deleteHub: (id: string) => void;

  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
  deleteVehicle: (id: string) => void;

  loadingParcels: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Map backend parcel row -> frontend Parcel type.
 * We build a plain JS object and then cast to Parcel to avoid TS complaining
 * about extra/missing fields while we gradually wire the DB.
 */
function mapApiParcel(row: any): Parcel {
  const mapped: any = {
    // Core IDs and routing
    id: row.parcel_id != null ? String(row.parcel_id) : "",
    trackingCode: row.tracking_code ?? "",
    senderId: row.sender_id != null ? String(row.sender_id) : "",
    // recipientId may not exist in the TS type yet, but we still keep it for DB use
    recipientId: row.recipient_id != null ? String(row.recipient_id) : "",
    originCityId:
      row.pickup_city_id != null ? String(row.pickup_city_id) : "",
    destinationCityId:
      row.delivery_city_id != null ? String(row.delivery_city_id) : "",
    currentHubId: row.assigned_hub_id != null ? String(row.assigned_hub_id) : "",
    courierId: row.assigned_courier_id != null ? String(row.assigned_courier_id) : "",

    // Status
    status: (row.status as Parcel["status"]) ?? "created",

    // Recipient info (backend may or may not have these yet, so default safe)
    recipientName: row.recipient_name ?? "",
    recipientPhone: row.recipient_phone ?? "",
    recipientAddress: row.recipient_address 
      || (row.recipient_address_street || row.recipient_address_area || row.recipient_address_city || row.recipient_address_pincode
        ? [
            row.recipient_address_street,
            row.recipient_address_area,
            row.recipient_address_city,
            row.recipient_address_pincode
          ].filter(Boolean).join(", ")
        : ""),

    // Dimensions / weight (DB uses *_kg, *_cm)
    weight: row.weight ?? row.weight_kg ?? 0,
    length: row.length ?? row.length_cm ?? 0,
    width: row.width ?? row.width_cm ?? 0,
    height: row.height ?? row.height_cm ?? 0,

    // Legacy / UI-friendly fields if your components still expect them
    weightKg: row.weight_kg ?? row.weight ?? 0,
    dimensions: row.dimensions ?? "",

    // Money
    fare: row.fare ?? 0,

    // Items inside parcel – for now we default to [] unless backend joins them in
    items: row.items ?? [],

    // Timestamps
    createdAt: row.created_at ?? "",
    expectedDeliveryDate: row.expected_delivery_date ?? null,
  };

  return mapped as Parcel;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [trackingEvents, setTrackingEvents] =
    useState<TrackingEvent[]>(initialTrackingEvents);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [auditLogs, setAuditLogs] =
    useState<AuditLog[]>(initialAuditLogs);
  const [citiesList, setCitiesList] = useState<typeof cities>(cities); // Start with mock data
  const [usersList, setUsersList] = useState<typeof users>([]);

  const [loadingParcels, setLoadingParcels] = useState(false);

  // ===== Load cities from backend =====
  useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      try {
        const apiAny = api as any;
        console.log("[DataContext] Attempting to load cities from backend...");
        
        // Use Promise.race to timeout after 2 seconds
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 2000)
        );

        const res = await Promise.race([
          apiAny.apiListCities(),
          timeoutPromise
        ]) as any;
        
        console.log("[DataContext] Cities API response:", res);
        if (!cancelled && res && Array.isArray(res.cities) && res.cities.length > 0) {
          const mapped = res.cities.map((c: any) => ({
            id: String(c.city_id),
            name: c.name,
            state: c.state_name || c.state || '',
            latitude: c.latitude || 0,
            longitude: c.longitude || 0,
          }));
          console.log("[DataContext] Mapped cities:", mapped.length);
          setCitiesList(mapped);
        } else {
          console.warn("[DataContext] No cities in response or empty, keeping mock data");
          // Keep existing citiesList (which starts with mock data)
        }
      } catch (e: any) {
        console.error("[DataContext] Failed to load cities:", e?.message || e);
        if (!cancelled) {
          console.log("[DataContext] Using fallback cities (mock data)");
          // Keep existing citiesList (which starts with mock data)
        }
      }
    }

    loadCities();
    return () => { 
      cancelled = true;
    };
  }, []);

  // ===== Load users from backend (admin only) =====
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      if (!user || user.role !== "admin") {
        setUsersList(users); // Use mock data for non-admins
        return;
      }

      try {
        const apiAny = api as any;
        const res = await apiAny.apiListUsers();
        if (!cancelled && res && Array.isArray(res.users)) {
          const mapped = res.users.map((u: any) => ({
            id: String(u.user_id),
            username: u.username,
            name: u.full_name,
            email: u.email,
            phone: u.phone || '',
            role: u.role,
            address: u.address_street || '',
            createdAt: u.created_at || '',
            password: '',
          }));
          setUsersList(mapped);
        }
      } catch (e) {
        console.error("[DataContext] Failed to load users:", e);
        if (!cancelled) {
          setUsersList(users); // Fallback to mock data
        }
      }
    }

    loadUsers();
    return () => { cancelled = true; };
  }, [user]);

  // ===== Load hubs from backend =====
  useEffect(() => {
    let cancelled = false;

    async function loadHubs() {
      try {
        const apiAny = api as any;
        const res = await apiAny.apiListHubs();
        if (!cancelled && res && Array.isArray(res.hubs)) {
          const mapped = res.hubs.map((h: any) => ({
            id: String(h.hub_id),
            name: h.name,
            cityId: h.city_id ? String(h.city_id) : '',
            address: h.address || '',
            capacity: h.capacity || 0,
            phone: h.contact || '',
            email: '',
          }));
          setHubs(mapped);
        }
      } catch (e) {
        console.error("[DataContext] Failed to load hubs:", e);
        if (!cancelled) {
          setHubs(initialHubs); // Fallback to mock data
        }
      }
    }

    loadHubs();
    return () => { cancelled = true; };
  }, []);

  // ===== Load vehicles from backend =====
  useEffect(() => {
    let cancelled = false;

    async function loadVehicles() {
      try {
        const apiAny = api as any;
        const res = await apiAny.apiListVehicles();
        if (!cancelled && res && Array.isArray(res.vehicles)) {
          const mapped = res.vehicles.map((v: any) => ({
            id: String(v.vehicle_id),
            licensePlate: v.license_plate,
            type: 'Van', // Default type
            courierId: v.courier_id ? String(v.courier_id) : '',
            capacity: v.capacity_kg || 0,
            status: (v.status === 'active' ? 'active' : v.status === 'maintenance' ? 'maintenance' : 'inactive') as 'active' | 'inactive' | 'maintenance',
          }));
          setVehicles(mapped);
        }
      } catch (e) {
        console.error("[DataContext] Failed to load vehicles:", e);
        if (!cancelled) {
          setVehicles(initialVehicles); // Fallback to mock data
        }
      }
    }

    loadVehicles();
    return () => { cancelled = true; };
  }, []);

  // ===== Load parcels from backend based on user role =====
  useEffect(() => {
    let cancelled = false;

    async function loadParcels() {
      if (!user) {
        setParcels([]);
        return;
      }

      setLoadingParcels(true);
      try {
        let res: any;

        // Cast api as any so TS doesn't complain about JS exports
        const apiAny = api as any;

        if (user.role === "customer") {
          res = await apiAny.apiListMyParcels();
        } else if (user.role === "courier") {
          res = await apiAny.apiListAssignedParcels();
        } else {
          // admin
          res = await apiAny.apiListAllParcels();
        }

        if (!cancelled && res && Array.isArray(res.parcels)) {
          const mapped = res.parcels.map(mapApiParcel);
          setParcels(mapped);
        }
      } catch (e) {
        console.error("[DataContext] Failed to load parcels:", e);
        if (!cancelled) {
          setParcels([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingParcels(false);
        }
      }
    }

    loadParcels();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ===== Local mutators with backend sync =====

  const updateParcel = async (id: string, updates: Partial<Parcel>) => {
    try {
      const apiAny = api as any;
      // Update backend
      const res = await apiAny.apiUpdateParcel(id, updates);
      if (res?.parcel) {
        // Update local state with backend response
        setParcels((prev) =>
          prev.map((p) => (p.id === id ? mapApiParcel(res.parcel) : p))
        );
      } else {
        // Fallback to local update if backend doesn't return parcel
        setParcels((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
      }
    } catch (error) {
      console.error("[DataContext] Failed to update parcel:", error);
      // Still update locally on error
      setParcels((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      throw error;
    }
  };

  const addTrackingEvent = (event: Omit<TrackingEvent, "id">) => {
    setTrackingEvents((prev) => {
      const newEvent: TrackingEvent = {
        ...event,
        id: `e${prev.length + 1}`,
      };
      return [...prev, newEvent];
    });
  };

  const addAuditLog = (log: Omit<AuditLog, "id">) => {
    setAuditLogs((prev) => {
      const newLog: AuditLog = {
        ...log,
        id: `a${prev.length + 1}`,
      };
      return [...prev, newLog];
    });
  };

  const updateHub = async (id: string, updates: Partial<Hub>) => {
    try {
      const apiAny = api as any;
      await apiAny.apiUpdateHub(id, updates);
      // Reload hubs
      const res = await apiAny.apiListHubs();
      if (res && Array.isArray(res.hubs)) {
        const mapped = res.hubs.map((h: any) => ({
          id: String(h.hub_id),
          name: h.name,
          cityId: h.city_id ? String(h.city_id) : '',
          address: h.address || '',
          capacity: h.capacity || 0,
          phone: h.contact || '',
          email: '',
        }));
        setHubs(mapped);
      }
    } catch (error) {
      console.error("[DataContext] Failed to update hub:", error);
      throw error;
    }
  };

  const addHub = async (hub: Omit<Hub, "id">) => {
    try {
      const apiAny = api as any;
      await apiAny.apiCreateHub({
        name: hub.name,
        city_id: parseInt(hub.cityId),
        address: hub.address,
        capacity: hub.capacity,
        contact: hub.phone,
      });
      // Reload hubs
      const res = await apiAny.apiListHubs();
      if (res && Array.isArray(res.hubs)) {
        const mapped = res.hubs.map((h: any) => ({
          id: String(h.hub_id),
          name: h.name,
          cityId: h.city_id ? String(h.city_id) : '',
          address: h.address || '',
          capacity: h.capacity || 0,
          phone: h.contact || '',
          email: '',
        }));
        setHubs(mapped);
      }
    } catch (error) {
      console.error("[DataContext] Failed to add hub:", error);
      throw error;
    }
  };

  const deleteHub = async (id: string) => {
    try {
      const apiAny = api as any;
      await apiAny.apiDeleteHub(id);
      setHubs((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error("[DataContext] Failed to delete hub:", error);
      throw error;
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      const apiAny = api as any;
      await apiAny.apiUpdateVehicle(id, {
        license_plate: updates.licensePlate,
        capacity_kg: updates.capacity,
        status: updates.status,
      });
      // Reload vehicles
      const res = await apiAny.apiListVehicles();
      if (res && Array.isArray(res.vehicles)) {
        const mapped = res.vehicles.map((v: any) => ({
          id: String(v.vehicle_id),
          licensePlate: v.license_plate,
          type: 'Van',
          courierId: v.courier_id ? String(v.courier_id) : '',
          capacity: v.capacity_kg || 0,
          status: (v.status === 'active' ? 'active' : v.status === 'maintenance' ? 'maintenance' : 'inactive') as 'active' | 'inactive' | 'maintenance',
        }));
        setVehicles(mapped);
      }
    } catch (error) {
      console.error("[DataContext] Failed to update vehicle:", error);
      throw error;
    }
  };

  const addVehicle = async (vehicle: Omit<Vehicle, "id">) => {
    try {
      const apiAny = api as any;
      await apiAny.apiCreateVehicle({
        courier_id: parseInt(vehicle.courierId),
        license_plate: vehicle.licensePlate,
        capacity_kg: vehicle.capacity,
        status: vehicle.status,
      });
      // Reload vehicles
      const res = await apiAny.apiListVehicles();
      if (res && Array.isArray(res.vehicles)) {
        const mapped = res.vehicles.map((v: any) => ({
          id: String(v.vehicle_id),
          licensePlate: v.license_plate,
          type: 'Van',
          courierId: v.courier_id ? String(v.courier_id) : '',
          capacity: v.capacity_kg || 0,
          status: (v.status === 'active' ? 'active' : v.status === 'maintenance' ? 'maintenance' : 'inactive') as 'active' | 'inactive' | 'maintenance',
        }));
        setVehicles(mapped);
      }
    } catch (error) {
      console.error("[DataContext] Failed to add vehicle:", error);
      throw error;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const apiAny = api as any;
      await apiAny.apiDeleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error("[DataContext] Failed to delete vehicle:", error);
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        parcels,
        trackingEvents,
        hubs,
        vehicles,
        auditLogs,
        cities: citiesList,
        users: usersList,
        updateParcel,
        addTrackingEvent,
        addAuditLog,
        updateHub,
        addHub,
        deleteHub,
        updateVehicle,
        addVehicle,
        deleteVehicle,
        loadingParcels,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}
