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
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="mx-auto grid max-w-6xl items-stretch gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="login-hero animate-fade-up relative min-h-[320px] lg:min-h-[560px]">
          <img
            src="/brand/cofc-banner.jpg"
            alt="الجهاز المركزي للرقابة المالية — Central Organization for Financial Control"
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
          <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-10">
            <div className="inline-flex w-fit items-center gap-3 rounded-2xl bg-black/25 px-3 py-2 backdrop-blur-sm">
              <img src="/brand/syria-emblem.png" alt="" className="h-12 w-12 object-contain drop-shadow" />
              <div className="text-[var(--gold-soft)]">
                <p className="text-sm font-semibold">الجهاز المركزي للرقابة المالية</p>
                <p className="text-xs opacity-80">نظام إدارة الإجازات</p>
              </div>
            </div>
            <div className="max-w-md rounded-2xl bg-[rgba(18,40,36,0.72)] p-5 text-[var(--gold-soft)] backdrop-blur-md md:p-6">
              <p className="text-xs font-semibold tracking-[0.14em] text-[var(--gold)]">منصة الإجازات الرسمية</p>
              <h1 className="mt-2 text-3xl leading-snug md:text-4xl">إدارة إجازات واضحة ومنظّمة.</h1>
              <p className="mt-3 text-sm leading-relaxed text-[var(--gold-soft)]/85">
                تقديم الطلبات، متابعة الأرصدة، واعتمادها عبر المدير ورؤساء فروع المحافظات.
              </p>
            </div>
          </div>
        </section>

        <form
          onSubmit={onSubmit}
          className="animate-fade-up animate-delay-1 flex flex-col justify-center rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] md:p-8"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <img src="/brand/syria-emblem.png" alt="شعار الجمهورية" className="h-16 w-16 object-contain" />
            <h2 className="mt-3 text-2xl text-[var(--brand-deep)]">تسجيل الدخول</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">الجهاز المركزي للرقابة المالية</p>
          </div>

          <div className="space-y-4">
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
