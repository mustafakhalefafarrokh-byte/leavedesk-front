export type Role = 'manager' | 'branch_head' | 'employee';

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  mustChangePassword: boolean;
  managedById?: string | null;
};

export type LeaveType = {
  id: string;
  typeName: string;
  defaultDays: number;
  isActive: boolean;
};

export type Balance = {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  leaveTypeActive?: boolean;
};

export type LeaveRequest = {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  status: LeaveRequestStatus;
  reason: string | null;
  rejectionReason: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  employeeName?: string;
  employeeEmail?: string;
  leaveTypeName?: string;
  reviewerName?: string | null;
  managedById?: string | null;
  canReview?: boolean;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  managedById?: string | null;
  createdAt: string;
  updatedAt: string;
  balances?: Balance[];
  leaveTypeIds?: string[];
};

export type BranchHead = User & {
  employeeCount?: number;
};
