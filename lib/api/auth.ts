import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { User, UserRole } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Single axios instance for all API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const publicEndpoints = ["/auth/login", "/auth/register", "/auth/verify-2fa"];

  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    config.url?.includes(endpoint)
  );

  if (isPublicEndpoint) {
    if (config.headers) {
      delete config.headers.Authorization;
    }
  } else {
    const token = Cookies.get("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

// API Response structure
interface ApiLoginResponseData {
  accessToken: string | null;
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
    twoFactorEnabled: boolean;
    [key: string]: unknown;
  } | null;
  tokenType: string | null;
  requiresTwoFactor?: boolean;
  message?: string;
}

interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  user: User | null;
  requiresTwoFactor: boolean;
  message?: string;
}

function mapApiUserToUser(apiUser: ApiLoginResponseData["user"]): User {
  if (!apiUser) {
    throw new Error("User data is missing");
  }

  const nameParts = apiUser.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

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
    twoFactorEnabled: apiUser.twoFactorEnabled || false,
  };
}

export const authService = {
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<ApiLoginResponseData>>(
      "/auth/register",
      data
    );
    const responseData = response.data.data;

    if (!responseData.accessToken || !responseData.user) {
      throw new Error("Registration failed: Missing token or user data");
    }

    Cookies.set("token", responseData.accessToken, { expires: 7 });

    return {
      token: responseData.accessToken, // TypeScript knows it's not null here
      user: mapApiUserToUser(responseData.user),
      requiresTwoFactor: false,
    };
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<ApiLoginResponseData>>(
      "/auth/login",
      data
    );
    const responseData = response.data.data;

    // If 2FA is required but no code provided, allow login to proceed
    // The user will verify 2FA in a modal after login
    if (responseData.requiresTwoFactor && !data.twoFactorCode) {
      // Store a temporary token if provided, or proceed without token
      // The backend should allow this and provide a way to verify 2FA later
      return {
        token: responseData.accessToken || "",
        user: null as unknown as User,
        requiresTwoFactor: true,
        message:
          responseData.message || "Two-factor authentication code required",
      };
    }

    // If 2FA code was provided and verification failed, throw error
    if (responseData.requiresTwoFactor && data.twoFactorCode) {
      throw new Error("Invalid 2FA code");
    }

    if (responseData.accessToken && responseData.user) {
      Cookies.set("token", responseData.accessToken, { expires: 7 });
      return {
        token: responseData.accessToken,
        user: mapApiUserToUser(responseData.user),
        requiresTwoFactor: false,
      };
    }

    throw new Error(responseData.message || "Login failed");
  },

  async verifyTwoFactor(email: string, code: string): Promise<LoginResponse> {
    // Validate inputs
    if (!email || !email.trim()) {
      throw new Error("Email is required for 2FA verification");
    }
    if (!code || code.length !== 6) {
      throw new Error("2FA code must be 6 digits");
    }

    const existingToken = Cookies.get("token");
    if (existingToken) {
      Cookies.remove("token");
    }

    const response = await api.post<ApiResponse<ApiLoginResponseData>>(
      "/auth/verify-2fa",
      { email: email.trim(), code }
    );
    const responseData = response.data.data;

    if (!responseData.accessToken || !responseData.user) {
      throw new Error(responseData.message || "2FA verification failed");
    }

    Cookies.set("token", responseData.accessToken, { expires: 7 });

    return {
      token: responseData.accessToken,
      user: mapApiUserToUser(responseData.user),
      requiresTwoFactor: false,
    };
  },

  async enableTwoFactor(): Promise<{
    message: string;
    enabled: boolean;
    qrCodeUrl?: string;
    secret?: string;
  }> {
    const response = await api.post<
      ApiResponse<{
        message: string;
        enabled: boolean;
        qrCodeUrl?: string;
        secret?: string;
      }>
    >("/auth/2fa/enable");
    return response.data.data;
  },

  async verifyAndEnableTwoFactor(
    code: string
  ): Promise<{ message: string; enabled: boolean }> {
    const response = await api.post<
      ApiResponse<{ message: string; enabled: boolean }>
    >("/auth/2fa/verify-enable", { code });
    return response.data.data;
  },

  async disableTwoFactor(): Promise<void> {
    await api.post("/auth/2fa/disable");
  },

  async verifyTwoFactorAfterLogin(
    email: string,
    code: string
  ): Promise<LoginResponse> {
    return this.verifyTwoFactor(email, code);
  },

  async getCurrentUser(): Promise<User> {
    const response =
      await api.get<ApiResponse<ApiLoginResponseData["user"]>>("/users/me");
    return mapApiUserToUser(response.data.data);
  },

  logout(): void {
    Cookies.remove("token");
    window.location.href = "/login";
  },
};
