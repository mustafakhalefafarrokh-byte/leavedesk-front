import type { PermissionCode, Role, User } from '../api/types';

export function isSupervisor(role: Role) {
  return role === 'manager' || role === 'branch_head';
}

export function hasPermission(user: User | null | undefined, permission: PermissionCode) {
  if (!user) return false;
  if (isSupervisor(user.role)) return true;
  return user.permissions?.includes(permission) ?? false;
}

export function canViewTeamRequests(user: User | null | undefined) {
  return (
    hasPermission(user, 'view_team_requests') || hasPermission(user, 'approve_reject_requests')
  );
}

export function canApproveRequests(user: User | null | undefined) {
  return hasPermission(user, 'approve_reject_requests');
}

export function canManageEmployees(user: User | null | undefined) {
  return hasPermission(user, 'manage_employees');
}
