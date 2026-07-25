import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import type { Balance } from '../../api/types';
import { Alert, Card, EmptyState, PageHeader, Spinner } from '../../components/ui';

export function EmployeeDashboard() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api<{ balances: Balance[] }>('/api/balances/me');
        setBalances(data.balances);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'فشل تحميل الأرصدة');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="أرصدة إجازاتي"
        subtitle="يتحدّث المتبقي فقط بعد اعتماد الطلب من المسؤول."
        action={
          <Link
            to="/employee/requests/new"
            className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
          >
            طلب إجازة
          </Link>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      {balances.length === 0 ? (
        <EmptyState title="لا توجد أرصدة" body="اطلب من مسؤولك تخصيص أنواع الإجازات لحسابك." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {balances.map((b, i) => {
            const pct = b.totalDays > 0 ? Math.min(100, Math.round((b.remainingDays / b.totalDays) * 100)) : 0;
            return (
              <Card key={b.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <p className="font-semibold">{b.leaveTypeName}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-[var(--muted)]">الإجمالي</p>
                    <p className="text-2xl font-semibold">{b.totalDays}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted)]">المستخدم</p>
                    <p className="text-2xl font-semibold">{b.usedDays}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted)]">المتبقي</p>
                    <p className="text-2xl font-semibold text-[var(--brand-deep)]">{b.remainingDays}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
                  <div className="h-full rounded-full bg-[var(--brand)] transition-all" style={{ width: `${pct}%` }} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
