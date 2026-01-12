export enum UserRole {
  STAFF = "STAFF",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export enum LeaveType {
  PERSONAL_TIME_OFF = "PERSONAL_TIME_OFF",
  SICK_LEAVE = "SICK_LEAVE",
  COMPASSIONATE_LEAVE = "COMPASSIONATE_LEAVE",
  MATERNITY_LEAVE = "MATERNITY_LEAVE",
  OTHER = "OTHER",
}

export enum LeaveStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING", // Keep for backward compatibility
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  twoFactorEnabled: boolean;
  managerId?: string;
}

export interface LeaveBalance {
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
  // Legacy fields for backward compatibility
  leaveType?: LeaveType;
  totalDays?: number;
  carryoverDays?: number;
  expiresAt?: string;
}

export interface LeaveApplication {
  id: string;
  userId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerComment?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  employeeId?: string;
  employeeName?: string;
  leaveType?: LeaveType;
  days?: number;
  submittedAt?: string;
  documents?: string[];
  approverId?: string;
  approverName?: string;
  approvalComments?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface LeaveTypeConfig {
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
  // Legacy fields for backward compatibility
  code?: LeaveType;
  maxDays?: number;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  year?: number;
  description?: string;
  isRecurring: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  read: boolean;
  createdAt: string;
}

export interface LeaveReport {
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  availableDays: number;
  applications: LeaveApplication[];
}

// API Response wrapper
export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

// Paginated response
export interface PageResponse<T> {
  totalPages: number;
  totalElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  first: boolean;
  last: boolean;
  size: number;
  content: T[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// Leave Request Filter
export interface LeaveRequestFilter {
  userId?: string;
  leaveTypeId?: string;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
  year?: number;
}

// Review Leave Request DTO
export interface ReviewLeaveRequestDTO {
  decision: "APPROVE" | "REJECT";
  comment?: string;
}
