import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Alert, Button, Field, Input } from '../../components/ui';

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      if (loggedIn.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate(loggedIn.role === 'admin' ? '/admin' : '/employee');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
      <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="animate-fade-up">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">LeaveDesk</p>
          <h1 className="mt-4 max-w-xl text-5xl leading-tight md:text-6xl">Leave that stays clear and fair.</h1>
          <p className="mt-4 max-w-lg text-lg text-[var(--muted)]">
            Submit requests, track balances, and approve with confidence — weekends excluded, balances updated only on approval.
          </p>
          <div className="mt-8 grid max-w-md gap-3 text-sm text-[var(--muted)]">
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 animate-fade-up animate-delay-1">
              Role-based admin and employee portals
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 animate-fade-up animate-delay-2">
              Working-day calculation with weekend exclusion
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 animate-fade-up animate-delay-3">
              Transaction-safe balance updates
            </div>
          </div>
        </section>

        <form
          onSubmit={onSubmit}
          className="animate-fade-up animate-delay-1 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] md:p-8"
        >
          <h2 className="text-2xl">Sign in</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Use your work email and password.</p>
          <div className="mt-6 space-y-4">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Field>
            {error ? <Alert>{error}</Alert> : null}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
