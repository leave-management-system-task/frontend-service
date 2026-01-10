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
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
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
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  availableDays: number;
  carryoverDays: number;
  expiresAt?: string;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: LeaveStatus;
  submittedAt: string;
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
  code: LeaveType;
  maxDays: number;
  accrualRate: number;
  requiresDocument: boolean;
  requiresReason: boolean;
  isActive: boolean;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
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
