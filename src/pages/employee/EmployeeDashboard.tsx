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
        setError(err instanceof ApiError ? err.message : 'Failed to load balances');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="My leave balances"
        subtitle="Remaining days update only after an admin approves a request."
        action={
          <Link
            to="/employee/requests/new"
            className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
          >
            Request leave
          </Link>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      {balances.length === 0 ? (
        <EmptyState title="No balances yet" body="Ask your admin to configure leave types for your account." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {balances.map((b, i) => {
            const pct = b.totalDays > 0 ? Math.min(100, Math.round((b.remainingDays / b.totalDays) * 100)) : 0;
            return (
              <Card key={b.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <p className="font-semibold">{b.leaveTypeName}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-[var(--muted)]">Total</p>
                    <p className="text-2xl font-semibold">{b.totalDays}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted)]">Used</p>
                    <p className="text-2xl font-semibold">{b.usedDays}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted)]">Remaining</p>
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
