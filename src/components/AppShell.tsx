import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../lib/labels';
import {
  canManageEmployees,
  canViewTeamRequests,
} from '../lib/permissions';
import { Button } from './ui';
import type { Role } from '../api/types';

function linksFor(role: Role, userPermissions: ReturnType<typeof useAuth>['user']) {
  if (role === 'manager') {
    return [
      { to: '/manager', label: 'لوحة التحكم', end: true },
      { to: '/manager/requests-all', label: 'كل الطلبات' },
      { to: '/manager/requests-team', label: 'طلبات فريقي' },
      { to: '/manager/employees', label: 'موظفيّ' },
      { to: '/manager/branch-heads', label: 'رؤساء الفروع' },
      { to: '/manager/leave-types', label: 'أنواع الإجازات' },
    ];
  }
  if (role === 'branch_head') {
    return [
      { to: '/branch', label: 'لوحة التحكم', end: true },
      { to: '/branch/requests', label: 'طلبات الإجازات' },
      { to: '/branch/employees', label: 'الموظفون' },
    ];
  }

  const links = [
    { to: '/employee', label: 'رصيدي', end: true },
    { to: '/employee/requests/new', label: 'طلب جديد' },
    { to: '/employee/requests', label: 'طلباتي' },
  ];
  if (canViewTeamRequests(userPermissions)) {
    links.push({ to: '/employee/team/requests', label: 'طلبات الفريق', end: false });
  }
  if (canManageEmployees(userPermissions)) {
    links.push({ to: '/employee/team/employees', label: 'موظفو الفريق', end: false });
  }
  return links;
}

export function AppShell({ role }: { role: Role }) {
  const { user, logout } = useAuth();
  const links = linksFor(role, user);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/90 backdrop-blur">
        <div className="border-b border-[var(--gold)]/30 bg-[var(--brand)] text-[var(--gold-soft)]">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
            <img src="/brand/syria-emblem.png" alt="" className="h-8 w-8 object-contain" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">الجهاز المركزي للرقابة المالية</p>
              <p className="truncate text-[10px] tracking-wide text-[var(--gold)]">
                CENTRAL ORGANIZATION FOR FINANCIAL CONTROL
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <div className="brand-mark">
              <img src="/brand/syria-emblem.png" alt="شعار" />
              <div>
                <p className="h-display text-lg text-[var(--brand-deep)]">نظام الإجازات</p>
                <p className="text-xs text-[var(--muted)]">{roleLabel[role]}</p>
              </div>
            </div>
            <Button variant="ghost" className="md:hidden" onClick={() => void logout()}>
              خروج
            </Button>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[var(--brand-soft)] text-[var(--brand-deep)]'
                      : 'text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <div className="text-left">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-[var(--muted)]" dir="ltr">
                {user?.username}
              </p>
            </div>
            <Button variant="secondary" onClick={() => void logout()}>
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
