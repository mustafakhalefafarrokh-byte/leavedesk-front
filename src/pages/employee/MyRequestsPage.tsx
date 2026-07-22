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
      setError(err instanceof ApiError ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function cancel(id: string) {
    if (!confirm('Cancel this pending request?')) return;
    try {
      await api(`/api/leave-requests/${id}/cancel`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cancel failed');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="My leave requests"
        subtitle="Track status and cancel pending requests before they are reviewed."
        action={
          <Link
            to="/employee/requests/new"
            className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            New request
          </Link>
        }
      />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}

      {requests.length === 0 ? (
        <EmptyState title="No requests yet" body="Submit your first leave request when you need time off." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Days</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-[var(--line)] last:border-0 align-top">
                  <td className="px-4 py-3 font-medium">{r.leaveTypeName}</td>
                  <td className="px-4 py-3">
                    {r.startDate} → {r.endDate}
                    {r.reason ? <p className="mt-1 text-xs text-[var(--muted)]">{r.reason}</p> : null}
                    {r.rejectionReason ? (
                      <p className="mt-1 text-xs text-red-700">Rejection: {r.rejectionReason}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{r.requestedDays}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' ? (
                      <Button variant="ghost" onClick={() => void cancel(r.id)}>
                        Cancel
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
