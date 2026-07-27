import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { homePathForRole } from '../../lib/labels';
import { Alert, Button, Field, Input } from '../../components/ui';

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
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
      const loggedIn = await login(username, password);
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
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[var(--shadow)] lg:grid-cols-2">
        <form onSubmit={onSubmit} className="order-2 flex flex-col justify-center px-6 py-10 md:px-10 lg:order-1">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 flex flex-col items-center text-center">
              <img src="/brand/syria-emblem.png" alt="شعار الجمهورية" className="h-16 w-16 object-contain" />
              <h1 className="mt-4 text-2xl font-bold text-[var(--brand-deep)]">تسجيل الدخول</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">الجهاز المركزي للرقابة المالية</p>
            </div>

            <div className="space-y-4 text-start">
              <Field label="اسم المستخدم">
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  dir="ltr"
                  className="text-start"
                  placeholder="مثال: manager"
                />
              </Field>
              <Field label="كلمة المرور">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  dir="ltr"
                  className="text-start"
                />
              </Field>
              {error ? <Alert>{error}</Alert> : null}
              <Button type="submit" className="mt-2 w-full" disabled={submitting}>
                {submitting ? 'جارٍ الدخول…' : 'دخول'}
              </Button>
            </div>
          </div>
        </form>

        <aside className="login-hero order-1 relative flex min-h-[280px] flex-col justify-between overflow-hidden p-6 md:p-8 lg:order-2 lg:min-h-[520px]">
          <img
            src="/brand/cofc-banner.jpg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-40"
            style={{ objectPosition: '70% center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[var(--brand-deep)] via-[rgba(26,51,46,0.88)] to-[rgba(26,51,46,0.92)]" />

          <div className="relative z-10 flex items-center gap-3">
            <img src="/brand/syria-emblem.png" alt="" className="h-11 w-11 object-contain drop-shadow" />
            <div className="text-[var(--gold-soft)]">
              <p className="text-sm font-semibold leading-snug">الجهاز المركزي للرقابة المالية</p>
              <p className="text-xs text-[var(--gold)]">نظام إدارة الإجازات</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-8">
            <img
              src="/brand/syria-emblem.png"
              alt=""
              className="h-28 w-28 object-contain opacity-95 drop-shadow-lg md:h-36 md:w-36"
            />
          </div>

          <div className="relative z-10 rounded-2xl border border-[var(--gold)]/25 bg-black/25 p-5 text-[var(--gold-soft)] backdrop-blur-sm">
            <p className="text-xs font-semibold text-[var(--gold)]">منصة الإجازات الرسمية</p>
            <p className="mt-2 text-2xl font-bold leading-snug md:text-3xl">إدارة إجازات واضحة ومنظّمة.</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--gold-soft)]/80">
              تقديم الطلبات، متابعة الأرصدة، واعتمادها عبر المدير ورؤساء فروع المحافظات.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
