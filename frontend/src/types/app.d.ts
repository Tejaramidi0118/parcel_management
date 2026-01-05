// src/types/api.d.ts
declare module "@/api" {
  export interface ApiUser {
    user_id: string;
    username: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    // allow additional fields
    [k: string]: any;
  }

  export interface SignupPayload {
    username: string;
    password: string;
    full_name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
  }

  export interface LoginRequest {
    id: string;
    password: string;
  }

  export interface LoginResponse {
    token: string;
    user: ApiUser;
  }

  export interface MeResponse {
    user: ApiUser;
  }

  export function apiSignup(payload: SignupPayload): Promise<MeResponse | any>;
  export function apiLogin(body: LoginRequest): Promise<LoginResponse>;
  export function apiMe(): Promise<MeResponse>;
  export function setAuthToken(token: string | null): void;
  export function clearAuthToken(): void;

  // in case you import the default
  const _default: {
    apiSignup: typeof apiSignup;
    apiLogin: typeof apiLogin;
    apiMe: typeof apiMe;
    setAuthToken: typeof setAuthToken;
    clearAuthToken: typeof clearAuthToken;
  };
  export default _default;
}
