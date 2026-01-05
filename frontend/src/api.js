// frontend/src/api.js

// Base URL detection
const ENV_BASE = import.meta.env.VITE_API_BASE;
const HOST = window.location.hostname;
const PORT_FALLBACK = 3000;
export const API_BASE = ENV_BASE || `http://${HOST}:${PORT_FALLBACK}`;

// In-memory auth token for attaching Authorization header
let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

// Core request helper – always returns parsed JSON or throws Error
async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;

  const finalOpts = { ...opts };
  finalOpts.headers = finalOpts.headers || {};

  // Default JSON header if body is provided
  if (
    finalOpts.body &&
    !finalOpts.headers["Content-Type"] &&
    !(finalOpts.body instanceof FormData)
  ) {
    finalOpts.headers["Content-Type"] = "application/json";
  }

  // Attach auth token if present
  if (authToken && !finalOpts.headers.Authorization) {
    finalOpts.headers.Authorization = `Bearer ${authToken}`;
  }

  console.log("[api] request ->", url, finalOpts);

  let res;
  try {
    res = await fetch(url, finalOpts);
  } catch (e) {
    console.error("[api] Network/fetch error:", e);
    throw new Error("Network error: " + (e.message || e));
  }

  const text = await res.text().catch(() => "");
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    console.error("[api] HTTP error", res.status, text.slice(0, 800));
    try {
      const json = text ? JSON.parse(text) : {};
      const msg =
        json?.error || json?.message || text || `HTTP ${res.status}`;
      throw new Error(msg);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  if (!contentType.includes("application/json")) {
    // Some endpoints may not return JSON; adapt if needed
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      console.warn(
        "[api] Non-JSON content-type but body looks like text:",
        contentType
      );
      return { raw: text };
    }
  }

  return text ? JSON.parse(text) : {};
}

/* ================== AUTH API ================== */

export function apiSignup(payload) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function apiLogin({ id, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ id, password }),
  });
}

export function apiMe() {
  return request("/auth/me", {
    method: "GET",
  });
}

/* ================== PARCEL API ================== */

// Create a new parcel (used by BookParcel form)
export function apiCreateParcel(payload) {
  return request("/parcel", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// List parcels for the logged-in customer (sender)
export function apiListMyParcels() {
  return request("/parcel/my", {
    method: "GET",
  });
}

// List parcels assigned to the logged-in courier
export function apiListAssignedParcels() {
  return request("/parcel/assigned", {
    method: "GET",
  });
}

// List all parcels (admin) or filtered
export function apiListAllParcels(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.sender_id) queryParams.append("sender_id", filters.sender_id);
  if (filters.courier_id) queryParams.append("courier_id", filters.courier_id);
  
  const query = queryParams.toString();
  return request(`/parcel${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

// Get parcel by ID
export function apiGetParcel(id) {
  return request(`/parcel/${id}`, {
    method: "GET",
  });
}

// Update parcel
export function apiUpdateParcel(id, payload) {
  return request(`/parcel/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Delete/Cancel parcel
export function apiDeleteParcel(id) {
  return request(`/parcel/${id}`, {
    method: "DELETE",
  });
}

// Update parcel status
export function apiUpdateParcelStatus(id, status, note) {
  return request(`/parcel/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, note }),
  });
}

// Assign courier to parcel (Admin only)
export function apiAssignCourier(parcelId, courierId) {
  return request(`/parcel/${parcelId}/assign`, {
    method: "POST",
    body: JSON.stringify({ courier_id: courierId }),
  });
}

/* ================== TRACKING API ================== */

// Get tracking info by tracking code (public)
export function apiGetTrackingByCode(trackingCode) {
  return request(`/tracking/${trackingCode}`, {
    method: "GET",
  });
}

// Get tracking events for parcel
export function apiGetTrackingEvents(parcelId) {
  return request(`/tracking/parcel/${parcelId}`, {
    method: "GET",
  });
}

// Create tracking event
export function apiCreateTrackingEvent(payload) {
  return request("/tracking/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ================== HUB API ================== */

// Get all hubs
export function apiListHubs(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.city_id) queryParams.append("city_id", filters.city_id);
  
  const query = queryParams.toString();
  return request(`/hub${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

// Get hub by ID
export function apiGetHub(id) {
  return request(`/hub/${id}`, {
    method: "GET",
  });
}

// Get parcels at hub
export function apiGetHubParcels(hubId) {
  return request(`/hub/${hubId}/parcels`, {
    method: "GET",
  });
}

// Create hub (Admin only)
export function apiCreateHub(payload) {
  return request("/hub", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Update hub (Admin only)
export function apiUpdateHub(id, payload) {
  return request(`/hub/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Delete hub (Admin only)
export function apiDeleteHub(id) {
  return request(`/hub/${id}`, {
    method: "DELETE",
  });
}

/* ================== VEHICLE API ================== */

// Get all vehicles
export function apiListVehicles(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.courier_id) queryParams.append("courier_id", filters.courier_id);
  if (filters.status) queryParams.append("status", filters.status);
  
  const query = queryParams.toString();
  return request(`/vehicle${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

// Get current courier's vehicle
export function apiGetMyVehicle() {
  return request("/vehicle/my", {
    method: "GET",
  });
}

// Get vehicle by ID
export function apiGetVehicle(id) {
  return request(`/vehicle/${id}`, {
    method: "GET",
  });
}

// Create vehicle (Admin only)
export function apiCreateVehicle(payload) {
  return request("/vehicle", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Update vehicle
export function apiUpdateVehicle(id, payload) {
  return request(`/vehicle/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Delete vehicle (Admin only)
export function apiDeleteVehicle(id) {
  return request(`/vehicle/${id}`, {
    method: "DELETE",
  });
}

/* ================== CITY API ================== */

// Get all cities
export function apiListCities(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.state_id) queryParams.append("state_id", filters.state_id);
  
  const query = queryParams.toString();
  return request(`/city${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

// Get city by ID
export function apiGetCity(id) {
  return request(`/city/${id}`, {
    method: "GET",
  });
}

// Create city (Admin only)
export function apiCreateCity(payload) {
  return request("/city", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Update city (Admin only)
export function apiUpdateCity(id, payload) {
  return request(`/city/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* ================== USER API ================== */

// Get all users (Admin only)
export function apiListUsers(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.role) queryParams.append("role", filters.role);
  
  const query = queryParams.toString();
  return request(`/user${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

// Get user by ID
export function apiGetUser(id) {
  return request(`/user/${id}`, {
    method: "GET",
  });
}

// Get user's parcels
export function apiGetUserParcels(userId) {
  return request(`/user/${userId}/parcels`, {
    method: "GET",
  });
}

// Update user
export function apiUpdateUser(id, payload) {
  return request(`/user/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Change password
export function apiChangePassword(userId, currentPassword, newPassword) {
  return request(`/user/${userId}/password`, {
    method: "PUT",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

// Delete user (Admin only)
export function apiDeleteUser(id) {
  return request(`/user/${id}`, {
    method: "DELETE",
  });
}

/* ================== AUDIT API ================== */

// Get audit logs (Admin only)
export function apiGetAuditLogs(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.entity_name) queryParams.append("entity_name", filters.entity_name);
  if (filters.entity_id) queryParams.append("entity_id", filters.entity_id);
  if (filters.actor_id) queryParams.append("actor_id", filters.actor_id);
  if (filters.limit) queryParams.append("limit", filters.limit);
  if (filters.offset) queryParams.append("offset", filters.offset);
  
  const query = queryParams.toString();
  return request(`/audit${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

// Get audit log by ID
export function apiGetAuditLog(id) {
  return request(`/audit/${id}`, {
    method: "GET",
  });
}

// Get audit logs for user
export function apiGetUserAuditLogs(userId, filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.limit) queryParams.append("limit", filters.limit);
  if (filters.offset) queryParams.append("offset", filters.offset);
  
  const query = queryParams.toString();
  return request(`/audit/user/${userId}${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

// Get audit logs for entity
export function apiGetEntityAuditLogs(entityType, entityId, filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.limit) queryParams.append("limit", filters.limit);
  if (filters.offset) queryParams.append("offset", filters.offset);
  
  const query = queryParams.toString();
  return request(`/audit/entity/${entityType}/${entityId}${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

/* ================== STATS API ================== */

// Get dashboard statistics (Admin only)
export function apiGetDashboardStats() {
  return request("/stats/dashboard", {
    method: "GET",
  });
}

// Get courier statistics
export function apiGetCourierStats(courierId = null) {
  const query = courierId ? `?courier_id=${courierId}` : "";
  return request(`/stats/courier${query}`, {
    method: "GET",
  });
}

/* ================== FARE API ================== */

// Calculate fare
export function apiCalculateFare(weight, length, width, height, distance = null) {
  const queryParams = new URLSearchParams();
  queryParams.append("weight", weight);
  queryParams.append("length", length);
  queryParams.append("width", width);
  queryParams.append("height", height);
  if (distance) queryParams.append("distance", distance);
  
  return request(`/fare/calculate?${queryParams.toString()}`, {
    method: "GET",
  });
}
