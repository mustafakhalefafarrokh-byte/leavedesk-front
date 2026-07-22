import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../../api/client';
import type { Employee, LeaveRequest } from '../../api/types';
import {
  Alert,
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  StatusBadge,
  Textarea,
} from '../../components/ui';

export function AdminRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejecting, setRejecting] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (userId) params.set('userId', userId);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      const [reqData, empData] = await Promise.all([
        api<{ leaveRequests: LeaveRequest[] }>(`/api/leave-requests/all${qs ? `?${qs}` : ''}`),
        api<{ employees: Employee[] }>('/api/employees'),
      ]);
      setRequests(reqData.leaveRequests);
      setEmployees(empData.employees);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function onFilter(e: FormEvent) {
    e.preventDefault();
    void load();
  }

  async function approve(id: string) {
    if (!confirm('Approve this leave request? Balance will be deducted.')) return;
    try {
      await api(`/api/leave-requests/${id}/approve`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Approve failed');
    }
  }

  async function reject() {
    if (!rejecting) return;
    try {
      await api(`/api/leave-requests/${rejecting.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason }),
      });
      setRejecting(null);
      setRejectionReason('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reject failed');
    }
  }

  return (
    <div>
      <PageHeader title="Leave requests" subtitle="Filter, approve, or reject pending leave across the team." />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}

      <form
        onSubmit={onFilter}
        className="mb-6 grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-[var(--shadow)] md:grid-cols-5"
      >
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>
        <Field label="Employee">
          <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">All</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="From">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To">
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Apply filters
          </Button>
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <EmptyState title="No matching requests" body="Try widening your filters or wait for new submissions." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
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
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.employeeName}</p>
                    <p className="text-xs text-[var(--muted)]">{r.employeeEmail}</p>
                  </td>
                  <td className="px-4 py-3">{r.leaveTypeName}</td>
                  <td className="px-4 py-3">
                    {r.startDate} → {r.endDate}
                    {r.reason ? <p className="mt-1 text-xs text-[var(--muted)]">{r.reason}</p> : null}
                    {r.rejectionReason ? (
                      <p className="mt-1 text-xs text-red-700">Reject: {r.rejectionReason}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{r.requestedDays}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' ? (
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => void approve(r.id)}>Approve</Button>
                        <Button variant="danger" onClick={() => setRejecting(r)}>
                          Reject
                        </Button>
                      </div>
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

      <Modal open={!!rejecting} title="Reject leave request" onClose={() => setRejecting(null)}>
        <div className="space-y-4">
          <Field label="Rejection reason (optional)">
            <Textarea rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void reject()}>
              Confirm reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
