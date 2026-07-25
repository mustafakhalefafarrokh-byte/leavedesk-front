import type { LeaveRequestStatus, Role } from '../api/types';

export const statusLabel: Record<LeaveRequestStatus, string> = {
  pending: 'معلّق',
  approved: 'معتمد',
  rejected: 'مرفوض',
  cancelled: 'ملغى',
};

export const roleLabel: Record<Role, string> = {
  manager: 'المدير',
  branch_head: 'رئيس فرع المحافظة',
  employee: 'موظف',
};

export function homePathForRole(role: Role) {
  if (role === 'manager') return '/manager';
  if (role === 'branch_head') return '/branch';
  return '/employee';
}
