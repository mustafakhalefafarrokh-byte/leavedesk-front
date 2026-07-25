import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import type { LeaveRequest } from '../../api/types';
import { Alert, Button, EmptyState, PageHeader, Spinner, StatusBadge } from '../../components/ui';

export function MyRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ leaveRequests: LeaveRequest[] }>('/api/leave-requests');
      setRequests(data.leaveRequests);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function cancel(id: string) {
    if (!confirm('إلغاء هذا الطلب المعلّق؟')) return;
    try {
      await api(`/api/leave-requests/${id}/cancel`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الإلغاء');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="طلباتي"
        subtitle="تابع الحالة ويمكنك إلغاء الطلبات المعلّقة قبل المراجعة."
        action={
          <Link
            to="/employee/requests/new"
            className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            طلب جديد
          </Link>
        }
      />
      {error ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      {requests.length === 0 ? (
        <EmptyState title="لا توجد طلبات بعد" body="قدّم أول طلب إجازة عند الحاجة." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <table className="min-w-full text-right text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">النوع</th>
                <th className="px-4 py-3 font-medium">التواريخ</th>
                <th className="px-4 py-3 font-medium">الأيام</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-[var(--line)] last:border-0 align-top">
                  <td className="px-4 py-3 font-medium">{r.leaveTypeName}</td>
                  <td className="px-4 py-3">
                    {r.startDate} ← {r.endDate}
                    {r.reason ? <p className="mt-1 text-xs text-[var(--muted)]">{r.reason}</p> : null}
                    {r.rejectionReason ? (
                      <p className="mt-1 text-xs text-red-700">سبب الرفض: {r.rejectionReason}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{r.requestedDays}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' ? (
                      <Button variant="ghost" onClick={() => void cancel(r.id)}>
                        إلغاء
                      </Button>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
