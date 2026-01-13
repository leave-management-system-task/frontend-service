import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { User, UserRole } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") + "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Response structure for user
interface ApiUserResponse {
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
}

interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

interface PaginatedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

function mapApiUserToUser(apiUser: ApiUserResponse): User {
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

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response =
      await api.get<ApiResponse<PaginatedResponse<ApiUserResponse>>>(
        "/users/all"
      );
    const usersData = response.data.data.content || response.data.data || [];
    return Array.isArray(usersData) ? usersData.map(mapApiUserToUser) : [];
  },

  async getUserById(userId: string): Promise<User> {
    const response = await api.get<ApiResponse<ApiUserResponse>>(
      `/users/${userId}`
    );
    return mapApiUserToUser(response.data.data);
  },

  async getUserFullNameById(userId: string): Promise<string> {
    try {
      const user = await this.getUserById(userId);
      return `${user.firstName} ${user.lastName}`.trim() || user.email;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      return "Unknown User";
    }
  },

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await api.patch<ApiResponse<ApiUserResponse>>(
      `/users/${userId}`,
      data
    );
    return mapApiUserToUser(response.data.data);
  },
};
