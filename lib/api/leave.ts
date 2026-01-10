import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import {
  LeaveApplication,
  LeaveBalance,
  LeaveTypeConfig,
  PublicHoliday,
  LeaveReport,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_LEAVE_SERVICE_URL ||
  "http://localhost:8081/api/leave";

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

export interface CreateLeaveApplicationRequest {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  documents?: File[];
}

export interface UpdateLeaveApplicationRequest {
  status: string;
  comments?: string;
}

export interface AdjustLeaveBalanceRequest {
  employeeId: string;
  leaveType: string;
  days: number;
  reason: string;
}

export interface CreateLeaveTypeRequest {
  name: string;
  code: string;
  maxDays: number;
  accrualRate: number;
  requiresDocument: boolean;
  requiresReason: boolean;
}

export const leaveService = {
  // Employee functions
  async getLeaveBalance(): Promise<LeaveBalance[]> {
    const response = await api.get<LeaveBalance[]>("/balance");
    return response.data;
  },

  async getMyApplications(): Promise<LeaveApplication[]> {
    const response = await api.get<LeaveApplication[]>("/applications/my");
    return response.data;
  },

  async createApplication(
    data: CreateLeaveApplicationRequest
  ): Promise<LeaveApplication> {
    const formData = new FormData();
    formData.append("leaveType", data.leaveType);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    if (data.reason) formData.append("reason", data.reason);
    if (data.documents) {
      data.documents.forEach((file) => {
        formData.append("documents", file);
      });
    }

    const response = await api.post<LeaveApplication>(
      "/applications",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async cancelApplication(applicationId: string): Promise<void> {
    await api.delete(`/applications/${applicationId}`);
  },

  async getColleaguesOnLeave(): Promise<LeaveApplication[]> {
    const response = await api.get<LeaveApplication[]>("/colleagues/on-leave");
    return response.data;
  },

  async getPublicHolidays(): Promise<PublicHoliday[]> {
    const response = await api.get<PublicHoliday[]>("/holidays");
    return response.data;
  },

  // Manager functions
  async getPendingApprovals(): Promise<LeaveApplication[]> {
    const response = await api.get<LeaveApplication[]>("/applications/pending");
    return response.data;
  },

  async updateApplicationStatus(
    applicationId: string,
    data: UpdateLeaveApplicationRequest
  ): Promise<LeaveApplication> {
    const response = await api.patch<LeaveApplication>(
      `/applications/${applicationId}/status`,
      data
    );
    return response.data;
  },

  // Admin/HR functions
  async getAllApplications(params?: {
    status?: string;
    employeeId?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<LeaveApplication[]> {
    const response = await api.get<LeaveApplication[]>("/applications", {
      params,
    });
    return response.data;
  },

  async getLeaveTypes(): Promise<LeaveTypeConfig[]> {
    const response = await api.get<LeaveTypeConfig[]>("/types");
    return response.data;
  },

  async createLeaveType(
    data: CreateLeaveTypeRequest
  ): Promise<LeaveTypeConfig> {
    const response = await api.post<LeaveTypeConfig>("/types", data);
    return response.data;
  },

  async updateLeaveType(
    id: string,
    data: Partial<CreateLeaveTypeRequest>
  ): Promise<LeaveTypeConfig> {
    const response = await api.patch<LeaveTypeConfig>(`/types/${id}`, data);
    return response.data;
  },

  async deleteLeaveType(id: string): Promise<void> {
    await api.delete(`/types/${id}`);
  },

  async adjustLeaveBalance(
    data: AdjustLeaveBalanceRequest
  ): Promise<LeaveBalance> {
    const response = await api.post<LeaveBalance>("/balance/adjust", data);
    return response.data;
  },

  async getEmployeeLeaveBalance(employeeId: string): Promise<LeaveBalance[]> {
    const response = await api.get<LeaveBalance[]>(`/balance/${employeeId}`);
    return response.data;
  },

  async getEmployeeCalendar(
    employeeId: string,
    year: number
  ): Promise<LeaveApplication[]> {
    const response = await api.get<LeaveApplication[]>(
      `/calendar/${employeeId}`,
      {
        params: { year },
      }
    );
    return response.data;
  },

  async generateReport(params: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    leaveType?: string;
  }): Promise<LeaveReport[]> {
    const response = await api.get<LeaveReport[]>("/reports", { params });
    return response.data;
  },
};
