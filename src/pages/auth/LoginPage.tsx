import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { homePathForRole } from '../../lib/labels';
import { Alert, Button, Field, Input } from '../../components/ui';

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
    return <Navigate to={homePathForRole(user.role)} replace />;
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
        navigate(homePathForRole(loggedIn.role));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تسجيل الدخول');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
      <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="animate-fade-up">
          <p className="text-sm font-semibold tracking-[0.12em] text-[var(--brand)]">مكتب الإجازات</p>
          <h1 className="mt-4 max-w-xl text-5xl leading-tight md:text-6xl">إدارة إجازات واضحة وعادلة.</h1>
          <p className="mt-4 max-w-lg text-lg text-[var(--muted)]">
            تقديم الطلبات، متابعة الأرصدة، والاعتماد من رئيس الفرع أو المدير — مع استثناء عطلة نهاية الأسبوع.
          </p>
        </section>

        <form
          onSubmit={onSubmit}
          className="animate-fade-up animate-delay-1 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] md:p-8"
        >
          <h2 className="text-2xl">تسجيل الدخول</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">استخدم بريدك الإلكتروني وكلمة المرور.</p>
          <div className="mt-6 space-y-4">
            <Field label="البريد الإلكتروني">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </Field>
            <Field label="كلمة المرور">
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
              {submitting ? 'جارٍ الدخول…' : 'دخول'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
