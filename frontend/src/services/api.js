/**
 * API Service
 * Handles all API calls to the backend
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Get auth token from localStorage
const getToken = () => {
    return localStorage.getItem('authToken');
};
// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
        const errorMessage = data.message || 'API request failed';
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
    }
    return data.data;
}
// API methods
export const api = {
    // GET request
    get: (endpoint) => {
        return apiRequest(endpoint, { method: 'GET' });
    },
    // POST request
    post: (endpoint, body) => {
        return apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },
    // PUT request
    put: (endpoint, body) => {
        return apiRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },
    // DELETE request
    delete: (endpoint) => {
        return apiRequest(endpoint, { method: 'DELETE' });
    },
    // PATCH request
    patch: (endpoint, body) => {
        return apiRequest(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },
};
// Auth API
export const authApi = {
    login: async (username, password) => {
        const response = await api.post('/auth/login', {
            username,
            password,
        });
        // Store token
        if (response.token) {
            localStorage.setItem('authToken', response.token);
        }
        return response;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        // Store token
        if (response.token) {
            localStorage.setItem('authToken', response.token);
        }
        return response;
    },
    getCurrentUser: async () => {
        return api.get('/auth/me');
    },
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    },
};
export default api;
