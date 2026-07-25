import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Alert, Card, PageHeader, Spinner } from '../../components/ui';

type Stats = {
  approved: number;
  pending: number;
  rejected: number;
  employees: number;
  branchHeads?: number;
  scope: string;
};

export function SupervisorDashboard({
  title,
  requestsPath,
  scope = 'team',
}: {
  title: string;
  requestsPath: string;
  scope?: 'team' | 'all';
}) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const qs = scope === 'all' ? '?scope=all' : '';
        const data = await api<{ stats: Stats }>(`/api/dashboard/stats${qs}`);
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'فشل تحميل الإحصائيات');
      } finally {
        setLoading(false);
      }
    })();
  }, [scope]);

  if (loading) return <Spinner />;

  const cards = [
    { label: 'معلّق', value: stats?.pending ?? 0, hint: 'بانتظار المراجعة' },
    { label: 'معتمد', value: stats?.approved ?? 0, hint: 'تم خصم الرصيد' },
    { label: 'مرفوض', value: stats?.rejected ?? 0, hint: 'أُعيد للموظف' },
    { label: 'الموظفون', value: stats?.employees ?? 0, hint: scope === 'all' ? 'في النظام' : 'ضمن فريقك' },
  ];

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={
          scope === 'all'
            ? 'عرض وإحصائيات على مستوى النظام (بدون اعتماد لطلبات الفروع الأخرى).'
            : 'ملخص طلبات وموظفي فريقك.'
        }
        action={
          <Link
            to={requestsPath}
            className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
          >
            عرض الطلبات
          </Link>
        }
      />
      {user?.role === 'manager' && scope === 'all' && stats?.branchHeads != null ? (
        <p className="mb-4 text-sm text-[var(--muted)]">عدد رؤساء الفروع: {stats.branchHeads}</p>
      ) : null}
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="animate-fade-up">
            <p className="text-sm font-medium text-[var(--muted)]">{card.label}</p>
            <p className="mt-3 h-display text-4xl text-[var(--brand-deep)]">{card.value}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{card.hint}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
