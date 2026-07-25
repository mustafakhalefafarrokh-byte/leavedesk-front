import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import type { LeaveRequestStatus } from '../api/types';
import { statusLabel } from '../lib/labels';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
      <div>
        <h1 className="text-3xl md:text-4xl text-[var(--ink)]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const styles = {
    primary: 'bg-[var(--brand)] text-[var(--gold-soft)] hover:bg-[var(--brand-mid)]',
    secondary: 'bg-white border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--brand-soft)]',
    danger: 'bg-[var(--danger)] text-white hover:opacity-90',
    ghost: 'bg-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:bg-black/5',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--brand-mid)] focus:ring-4 focus:ring-[var(--gold-soft)] ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--brand-mid)] focus:ring-4 focus:ring-[var(--gold-soft)] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--brand-mid)] focus:ring-4 focus:ring-[var(--gold-soft)] ${className}`}
      {...props}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block w-full text-start text-sm font-medium text-[var(--ink)]">{children}</label>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="w-full text-start">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function Alert({
  tone = 'error',
  children,
}: {
  tone?: 'error' | 'success' | 'info';
  children: ReactNode;
}) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-teal-200 bg-teal-50 text-teal-900',
  }[tone];
  return <div className={`rounded-xl border px-3.5 py-3 text-sm ${styles}`}>{children}</div>;
}

export function StatusBadge({ status }: { status: LeaveRequestStatus | string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-900',
    approved: 'bg-emerald-100 text-emerald-900',
    rejected: 'bg-red-100 text-red-900',
    cancelled: 'bg-slate-100 text-slate-700',
  };
  const label = statusLabel[status as LeaveRequestStatus] ?? status;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] ?? 'bg-slate-100'}`}>
      {label}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/70 px-6 py-12 text-center">
      <p className="h-display text-xl">{title}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--brand-soft)] border-t-[var(--brand)]" />
    </div>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,31,28,0.45)] p-4" onClick={onClose}>
      <div
        className="w-full max-w-md animate-fade-up rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl">{title}</h2>
          <Button variant="ghost" type="button" onClick={onClose} aria-label="إغلاق">
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
