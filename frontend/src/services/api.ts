/**
 * API Service
 * Handles all API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// API response type
interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
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

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || data.status === 'error') {
    const errorMessage = data.message || 'API request failed';
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  return data.data as T;
}

// API methods
export const api = {
  // GET request
  get: <T>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'GET' });
  },

  // POST request
  post: <T>(endpoint: string, body?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // PUT request
  put: <T>(endpoint: string, body?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  // DELETE request
  delete: <T>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  },

  // PATCH request
  patch: <T>(endpoint: string, body?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
};

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post<{ user: any; token: string }>('/auth/login', {
      username,
      password,
    });
    
    // Store token
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  register: async (userData: any) => {
    const response = await api.post<{ user: any; token: string }>('/auth/register', userData);
    
    // Store token
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  getCurrentUser: async () => {
    return api.get<{ user: any }>('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },
};

export default api;

