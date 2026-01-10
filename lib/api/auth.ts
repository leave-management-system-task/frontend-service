import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { User, UserRole } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
  "http://localhost:8822/api/v1/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// API Response structure
interface ApiLoginResponseData {
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    roles: Array<{
      id: string;
      name: string;
      description: string;
    }>;
    createdAt: string;
    updatedAt: string;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    enabled: boolean;
    username: string;
    [key: string]: unknown;
  };
  tokenType: string;
}

interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  user: User;
  requiresTwoFactor: boolean;
  twoFactorSecret?: string;
  qrCodeUrl?: string;
}

// Helper function to map API user to User interface
function mapApiUserToUser(apiUser: ApiLoginResponseData["user"]): User {
  // Extract firstName and lastName from fullName
  const nameParts = apiUser.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Extract role from roles array (take the first role, or default to STAFF)
  const roleName = apiUser.roles?.[0]?.name || "STAFF";
  let role: UserRole;
  switch (roleName.toUpperCase()) {
    case "STAFF":
      role = UserRole.STAFF;
      break;
    case "MANAGER":
      role = UserRole.MANAGER;
      break;
    case "ADMIN":
      role = UserRole.ADMIN;
      break;
    default:
      role = UserRole.STAFF;
  }

  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName,
    lastName,
    role,
    twoFactorEnabled: false
  };
}

export const authService = {
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<ApiLoginResponseData>>(
      "/register",
      data
    );
    const responseData = response.data.data;

    if (responseData.accessToken) {
      Cookies.set("token", responseData.accessToken, { expires: 7 });
    }

    return {
      token: responseData.accessToken,
      user: mapApiUserToUser(responseData.user),
      requiresTwoFactor: false,
    };
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<ApiLoginResponseData>>(
      "/login",
      data
    );
    const responseData = response.data.data;

    if (responseData.accessToken) {
      Cookies.set("token", responseData.accessToken, { expires: 7 });
    }

    return {
      token: responseData.accessToken,
      user: mapApiUserToUser(responseData.user),
      requiresTwoFactor: false,
    };
  },

  async verifyTwoFactor(code: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<ApiLoginResponseData>>(
      "/verify-2fa",
      { code }
    );
    const responseData = response.data.data;

    if (responseData.accessToken) {
      Cookies.set("token", responseData.accessToken, { expires: 7 });
    }

    return {
      token: responseData.accessToken,
      user: mapApiUserToUser(responseData.user),
      requiresTwoFactor: false,
    };
  },

  async enableTwoFactor(): Promise<{ secret: string; qrCodeUrl: string }> {
    const response = await api.post<{ secret: string; qrCodeUrl: string }>(
      "/2fa/enable"
    );
    return response.data;
  },

  async disableTwoFactor(): Promise<void> {
    await api.post("/2fa/disable");
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/me");
    return response.data;
  },

  logout(): void {
    Cookies.remove("token");
    window.location.href = "/login";
  },
};
