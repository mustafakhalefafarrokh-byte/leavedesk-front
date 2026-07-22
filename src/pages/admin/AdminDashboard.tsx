import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import { Alert, Card, PageHeader, Spinner } from '../../components/ui';

type Stats = { approved: number; pending: number; rejected: number };

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api<{ stats: Stats }>('/api/dashboard/stats');
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  const cards = [
    { label: 'Pending', value: stats?.pending ?? 0, hint: 'Waiting for review', tone: 'text-amber-700' },
    { label: 'Approved', value: stats?.approved ?? 0, hint: 'Balance deducted', tone: 'text-emerald-700' },
    { label: 'Rejected', value: stats?.rejected ?? 0, hint: 'Returned to employee', tone: 'text-red-700' },
  ];

  return (
    <div>
      <PageHeader
        title="Admin dashboard"
        subtitle="A quick pulse on leave activity across the company."
        action={
          <Link
            to="/admin/requests"
            className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
          >
            Review requests
          </Link>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card, i) => (
          <Card key={card.label} className={`animate-fade-up animate-delay-${i}`}>
            <p className="text-sm font-medium text-[var(--muted)]">{card.label}</p>
            <p className={`mt-3 h-display text-4xl ${card.tone}`}>{card.value}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{card.hint}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
