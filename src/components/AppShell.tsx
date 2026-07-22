import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/requests', label: 'Requests' },
  { to: '/admin/leave-types', label: 'Leave Types' },
  { to: '/admin/employees', label: 'Employees' },
];

const employeeLinks = [
  { to: '/employee', label: 'Dashboard', end: true },
  { to: '/employee/requests/new', label: 'New Request' },
  { to: '/employee/requests', label: 'My Requests' },
];

export function AppShell({ variant }: { variant: 'admin' | 'employee' }) {
  const { user, logout } = useAuth();
  const links = variant === 'admin' ? adminLinks : employeeLinks;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="h-display text-xl text-[var(--brand-deep)]">LeaveDesk</p>
              <p className="text-xs text-[var(--muted)] capitalize">{variant} portal</p>
            </div>
            <Button variant="ghost" className="md:hidden" onClick={() => void logout()}>
              Log out
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
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-[var(--muted)]">{user?.email}</p>
            </div>
            <Button variant="secondary" onClick={() => void logout()}>
              Log out
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
