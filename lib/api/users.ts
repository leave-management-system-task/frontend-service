import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { User } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:8080/api/users";

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

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/");
    return response.data;
  },

  async getUserById(userId: string): Promise<User> {
    const response = await api.get<User>(`/${userId}`);
    return response.data;
  },

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await api.patch<User>(`/${userId}`, data);
    return response.data;
  },
};
