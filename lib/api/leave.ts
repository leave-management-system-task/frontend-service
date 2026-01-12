import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import {
  LeaveApplication,
  LeaveBalance,
  LeaveTypeConfig,
  PublicHoliday,
  ApiResponse,
  PageResponse,
  LeaveRequestFilter,
  ReviewLeaveRequestDTO,
  LeaveStatus,
} from "@/types";

// API Response types
interface LeaveRequestResponseDTO {
  id: string;
  userId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerComment?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface LeaveBalanceResponseDTO {
  id: string;
  userId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  totalAllocated: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  carriedOverDays: number;
  accruedDays: number;
  lastAccrualDate?: string;
}

interface LeaveTypeResponseDTO {
  id: string;
  name: string;
  description?: string;
  annualAllocation: number;
  accrualRate: number;
  requiresDocument: boolean;
  requiresReason: boolean;
  maxCarryoverDays?: number;
  carryoverExpiryMonth?: number;
  carryoverExpiryDay?: number;
  isActive: boolean;
}

interface PublicHolidayResponseDTO {
  id: string;
  name: string;
  date: string;
  year?: number;
  description?: string;
  isRecurring: boolean;
}

interface LeaveBalanceAdjustmentResponseDTO {
  id: string;
  leaveBalanceId: string;
  adjustedBy: string;
  adjustmentAmount: number;
  reason: string;
  previousBalance: number;
  newBalance: number;
  createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to all requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
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

// Request DTOs
export interface CreateLeaveRequestDTO {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  document?: File;
}

export interface UpdateLeaveRequestDTO {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  document?: File;
}

export interface CreateLeaveTypeDTO {
  name: string;
  description?: string;
  annualAllocation?: number;
  accrualRate?: number;
  requiresDocument: boolean;
  requiresReason: boolean;
  maxCarryoverDays?: number;
  carryoverExpiryMonth?: number;
  carryoverExpiryDay?: number;
}

export interface UpdateLeaveTypeDTO {
  name?: string;
  description?: string;
  annualAllocation?: number;
  accrualRate?: number;
  requiresDocument?: boolean;
  requiresReason?: boolean;
  maxCarryoverDays?: number;
  carryoverExpiryMonth?: number;
  carryoverExpiryDay?: number;
  isActive?: boolean;
}

export interface CreatePublicHolidayDTO {
  name: string;
  date: string;
  description?: string;
  isRecurring: boolean;
}

export interface UpdatePublicHolidayDTO {
  name?: string;
  date?: string;
  description?: string;
  isRecurring?: boolean;
}

export interface AdjustLeaveBalanceDTO {
  adjustmentAmount: number;
  reason: string;
}

// Helper function to map API response to LeaveApplication
function mapLeaveRequestResponse(
  apiResponse: LeaveRequestResponseDTO
): LeaveApplication {
  return {
    id: apiResponse.id,
    userId: apiResponse.userId,
    leaveTypeId: apiResponse.leaveTypeId,
    leaveTypeName: apiResponse.leaveTypeName,
    startDate: apiResponse.startDate,
    endDate: apiResponse.endDate,
    numberOfDays: apiResponse.numberOfDays,
    reason: apiResponse.reason,
    status: apiResponse.status as LeaveStatus,
    reviewedBy: apiResponse.reviewedBy,
    reviewedAt: apiResponse.reviewedAt,
    reviewerComment: apiResponse.reviewerComment,
    documentUrl: apiResponse.documentUrl,
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt,
    // Legacy mapping
    employeeId: apiResponse.userId,
    days: apiResponse.numberOfDays,
    submittedAt: apiResponse.createdAt,
    documents: apiResponse.documentUrl ? [apiResponse.documentUrl] : undefined,
    approverId: apiResponse.reviewedBy,
    approvalComments: apiResponse.reviewerComment,
    approvedAt:
      apiResponse.status === "APPROVED" ? apiResponse.reviewedAt : undefined,
    rejectedAt:
      apiResponse.status === "REJECTED" ? apiResponse.reviewedAt : undefined,
  };
}

// Helper function to map API response to LeaveBalance
function mapLeaveBalanceResponse(
  apiResponse: LeaveBalanceResponseDTO
): LeaveBalance {
  return {
    id: apiResponse.id,
    userId: apiResponse.userId,
    leaveTypeId: apiResponse.leaveTypeId,
    leaveTypeName: apiResponse.leaveTypeName,
    year: apiResponse.year,
    totalAllocated: apiResponse.totalAllocated,
    usedDays: apiResponse.usedDays,
    pendingDays: apiResponse.pendingDays,
    availableDays: apiResponse.availableDays,
    carriedOverDays: apiResponse.carriedOverDays,
    accruedDays: apiResponse.accruedDays,
    lastAccrualDate: apiResponse.lastAccrualDate,
    // Legacy mapping
    totalDays: apiResponse.totalAllocated,
    carryoverDays: apiResponse.carriedOverDays,
  };
}

// Helper function to map API response to LeaveTypeConfig
function mapLeaveTypeResponse(
  apiResponse: LeaveTypeResponseDTO
): LeaveTypeConfig {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    description: apiResponse.description,
    annualAllocation: apiResponse.annualAllocation,
    accrualRate: apiResponse.accrualRate,
    requiresDocument: apiResponse.requiresDocument,
    requiresReason: apiResponse.requiresReason,
    maxCarryoverDays: apiResponse.maxCarryoverDays,
    carryoverExpiryMonth: apiResponse.carryoverExpiryMonth,
    carryoverExpiryDay: apiResponse.carryoverExpiryDay,
    isActive: apiResponse.isActive,
    // Legacy mapping
    maxDays: apiResponse.annualAllocation,
  };
}

// Helper function to map API response to PublicHoliday
function mapPublicHolidayResponse(
  apiResponse: PublicHolidayResponseDTO
): PublicHoliday {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    date: apiResponse.date,
    year: apiResponse.year,
    description: apiResponse.description,
    isRecurring: apiResponse.isRecurring,
  };
}

export const leaveService = {
  // ============ Leave Requests ============

  async getLeaveRequestById(id: string): Promise<LeaveApplication> {
    const response = await api.get<ApiResponse<LeaveRequestResponseDTO>>(
      `/api/leave-requests/${id}`
    );
    return mapLeaveRequestResponse(response.data.data);
  },

  async createLeaveRequest(
    data: CreateLeaveRequestDTO
  ): Promise<LeaveApplication> {
    const formData = new FormData();
    formData.append("leaveTypeId", data.leaveTypeId);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    if (data.reason) formData.append("reason", data.reason);
    if (data.document) formData.append("document", data.document);

    const response = await api.post<ApiResponse<LeaveRequestResponseDTO>>(
      "/api/leave-requests",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return mapLeaveRequestResponse(response.data.data);
  },

  async updateLeaveRequest(
    id: string,
    data: UpdateLeaveRequestDTO
  ): Promise<LeaveApplication> {
    const formData = new FormData();
    formData.append("leaveTypeId", data.leaveTypeId);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    if (data.reason) formData.append("reason", data.reason);
    if (data.document) formData.append("document", data.document);

    const response = await api.put<ApiResponse<LeaveRequestResponseDTO>>(
      `/leave-requests/${id}?dto=${encodeURIComponent(JSON.stringify(data))}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return mapLeaveRequestResponse(response.data.data);
  },

  async cancelLeaveRequest(id: string): Promise<void> {
    await api.delete(`/leave-requests/${id}`);
  },

  async reviewLeaveRequest(
    id: string,
    data: ReviewLeaveRequestDTO
  ): Promise<LeaveApplication> {
    const response = await api.put<ApiResponse<LeaveRequestResponseDTO>>(
      `/leave-requests/${id}/review`,
      data
    );
    return mapLeaveRequestResponse(response.data.data);
  },

  async getMyLeaveRequests(params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<LeaveApplication>> {
    const response = await api.get<
      ApiResponse<PageResponse<LeaveRequestResponseDTO>>
    >("/leave-requests/my-requests", { params });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapLeaveRequestResponse),
    };
  },

  async getPendingLeaveRequests(params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<LeaveApplication>> {
    const response = await api.get<
      ApiResponse<PageResponse<LeaveRequestResponseDTO>>
    >("/leave-requests/pending", { params });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapLeaveRequestResponse),
    };
  },

  async getFilteredLeaveRequests(
    filter: LeaveRequestFilter,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<LeaveApplication>> {
    const response = await api.get<
      ApiResponse<PageResponse<LeaveRequestResponseDTO>>
    >("/leave-requests/filter", {
      params: {
        ...params,
        filter: JSON.stringify(filter),
      },
    });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapLeaveRequestResponse),
    };
  },

  async getCurrentlyOnLeave(params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<LeaveApplication>> {
    const response = await api.get<
      ApiResponse<PageResponse<LeaveRequestResponseDTO>>
    >("/leave-requests/currently-on-leave", { params });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapLeaveRequestResponse),
    };
  },

  async getApprovedLeavesInRange(
    startDate: string,
    endDate: string,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<LeaveApplication>> {
    const response = await api.get<
      ApiResponse<PageResponse<LeaveRequestResponseDTO>>
    >("/leave-requests/approved", {
      params: {
        startDate,
        endDate,
        ...params,
      },
    });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapLeaveRequestResponse),
    };
  },

  // ============ Leave Types ============

  async getLeaveTypeById(id: string): Promise<LeaveTypeConfig> {
    const response = await api.get<ApiResponse<LeaveTypeResponseDTO>>(
      `/leave-types/${id}`
    );
    return mapLeaveTypeResponse(response.data.data);
  },

  async getAllLeaveTypes(params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<LeaveTypeConfig>> {
    const response = await api.get<
      ApiResponse<PageResponse<LeaveTypeResponseDTO>>
    >("/leave-types", { params });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapLeaveTypeResponse),
    };
  },

  async getActiveLeaveTypes(params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<LeaveTypeConfig>> {
    const response = await api.get<
      ApiResponse<PageResponse<LeaveTypeResponseDTO>>
    >("/leave-types/active", { params });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapLeaveTypeResponse),
    };
  },

  async createLeaveType(data: CreateLeaveTypeDTO): Promise<LeaveTypeConfig> {
    const response = await api.post<ApiResponse<LeaveTypeResponseDTO>>(
      "/leave-types",
      data
    );
    return mapLeaveTypeResponse(response.data.data);
  },

  async updateLeaveType(
    id: string,
    data: UpdateLeaveTypeDTO
  ): Promise<LeaveTypeConfig> {
    const response = await api.put<ApiResponse<LeaveTypeResponseDTO>>(
      `/leave-types/${id}`,
      data
    );
    return mapLeaveTypeResponse(response.data.data);
  },

  async deleteLeaveType(id: string): Promise<void> {
    await api.delete(`/leave-types/${id}`);
  },

  // ============ Leave Balances ============

  async getLeaveBalanceById(balanceId: string): Promise<LeaveBalance> {
    const response = await api.get<ApiResponse<LeaveBalanceResponseDTO>>(
      `/leave-balances/${balanceId}`
    );
    return mapLeaveBalanceResponse(response.data.data);
  },

  async getUserLeaveBalances(
    userId: string,
    params?: {
      year?: number;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<LeaveBalance>> {
    const response = await api.get<
      ApiResponse<PageResponse<LeaveBalanceResponseDTO>>
    >(`/leave-balances/users/${userId}`, { params });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapLeaveBalanceResponse),
    };
  },

  async getMyLeaveBalances(params?: {
    year?: number;
    page?: number;
    size?: number;
  }): Promise<PageResponse<LeaveBalance>> {
    const response = await api.get<
      ApiResponse<PageResponse<LeaveBalanceResponseDTO>>
    >("/leave-balances/my-balances", { params });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapLeaveBalanceResponse),
    };
  },

  async adjustLeaveBalance(
    balanceId: string,
    data: AdjustLeaveBalanceDTO
  ): Promise<LeaveBalanceAdjustmentResponseDTO> {
    const response = await api.post<
      ApiResponse<LeaveBalanceAdjustmentResponseDTO>
    >(`/leave-balances/${balanceId}/adjust`, data);
    return response.data.data;
  },

  async getBalanceAdjustments(
    balanceId: string,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<LeaveBalanceAdjustmentResponseDTO>> {
    const response = await api.get<
      ApiResponse<PageResponse<LeaveBalanceAdjustmentResponseDTO>>
    >(`/leave-balances/${balanceId}/adjustments`, { params });
    return response.data.data;
  },

  async initializeUserLeaveBalances(
    userId: string,
    year: number
  ): Promise<void> {
    await api.post(`/leave-balances/users/${userId}/initialize`, null, {
      params: { year },
    });
  },

  // ============ Public Holidays ============

  async getPublicHolidayById(id: string): Promise<PublicHoliday> {
    const response = await api.get<ApiResponse<PublicHolidayResponseDTO>>(
      `/public-holidays/${id}`
    );
    return mapPublicHolidayResponse(response.data.data);
  },

  async getAllPublicHolidays(params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<PublicHoliday>> {
    const response = await api.get<
      ApiResponse<PageResponse<PublicHolidayResponseDTO>>
    >("/public-holidays", { params });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapPublicHolidayResponse),
    };
  },

  async getPublicHolidaysByYear(
    year: number,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<PublicHoliday>> {
    const response = await api.get<
      ApiResponse<PageResponse<PublicHolidayResponseDTO>>
    >(`/public-holidays/year/${year}`, { params });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapPublicHolidayResponse),
    };
  },

  async getUpcomingPublicHolidays(params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<PublicHoliday>> {
    const response = await api.get<
      ApiResponse<PageResponse<PublicHolidayResponseDTO>>
    >("/public-holidays/upcoming", { params });
    return {
      ...response.data.data,
      content: response.data.data.content.map(mapPublicHolidayResponse),
    };
  },

  async createPublicHoliday(
    data: CreatePublicHolidayDTO
  ): Promise<PublicHoliday> {
    const response = await api.post<ApiResponse<PublicHolidayResponseDTO>>(
      "/public-holidays",
      data
    );
    return mapPublicHolidayResponse(response.data.data);
  },

  async updatePublicHoliday(
    id: string,
    data: UpdatePublicHolidayDTO
  ): Promise<PublicHoliday> {
    const response = await api.put<ApiResponse<PublicHolidayResponseDTO>>(
      `/public-holidays/${id}`,
      data
    );
    return mapPublicHolidayResponse(response.data.data);
  },

  async deletePublicHoliday(id: string): Promise<void> {
    await api.delete(`/public-holidays/${id}`);
  },

  // ============ Reports ============

  async downloadLeaveReportExcel(params?: {
    year?: number;
    status?: string;
  }): Promise<Blob> {
    const response = await api.get("/reports/leave-requests/excel", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  async downloadLeaveReportCSV(params?: {
    year?: number;
    status?: string;
  }): Promise<Blob> {
    const response = await api.get("/reports/leave-requests/csv", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  async getLeaveBalanceLegacy(): Promise<LeaveBalance[]> {
    const response = await this.getMyLeaveBalances();
    return response.content;
  },

  async getMyApplications(): Promise<LeaveApplication[]> {
    const response = await this.getMyLeaveRequests();
    return response.content;
  },

  async getPendingApprovals(): Promise<LeaveApplication[]> {
    const response = await this.getPendingLeaveRequests();
    return response.content;
  },

  async getLeaveTypes(): Promise<LeaveTypeConfig[]> {
    const response = await this.getActiveLeaveTypes({ size: 100 });
    return response.content;
  },

  async getPublicHolidays(): Promise<PublicHoliday[]> {
    const response = await this.getAllPublicHolidays({ size: 100 });
    return response.content;
  },

  async getColleaguesOnLeave(): Promise<LeaveApplication[]> {
    const response = await this.getCurrentlyOnLeave();
    return response.content;
  },
};
