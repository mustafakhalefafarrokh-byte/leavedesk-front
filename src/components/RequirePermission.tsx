import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePathForRole } from '../lib/labels';
import { hasPermission, isSupervisor } from '../lib/permissions';
import type { PermissionCode } from '../api/types';
import { Spinner } from './ui';

/** Allows supervisor roles or employees holding any of the listed permissions. */
export function RequirePermission({ anyOf }: { anyOf: PermissionCode[] }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (isSupervisor(user.role) || anyOf.some((p) => hasPermission(user, p))) {
    return <Outlet />;
  }
  return <Navigate to={homePathForRole(user.role)} replace />;
}
