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

export function RequestsPage({
  title,
  subtitle,
  endpoint,
  allowActions,
}: {
  title: string;
  subtitle: string;
  endpoint: '/api/leave-requests/team' | '/api/leave-requests/all';
  allowActions: boolean;
}) {
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
        api<{ leaveRequests: LeaveRequest[] }>(`${endpoint}${qs ? `?${qs}` : ''}`),
        api<{ employees: Employee[] }>('/api/employees').catch(() => ({ employees: [] as Employee[] })),
      ]);
      setRequests(reqData.leaveRequests);
      setEmployees(empData.employees);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [endpoint]);

  function onFilter(e: FormEvent) {
    e.preventDefault();
    void load();
  }

  async function approve(id: string) {
    if (!confirm('اعتماد طلب الإجازة؟ سيتم خصم الرصيد.')) return;
    try {
      await api(`/api/leave-requests/${id}/approve`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الاعتماد');
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
      setError(err instanceof ApiError ? err.message : 'فشل الرفض');
    }
  }

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      {error ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <form
        onSubmit={onFilter}
        className="mb-6 grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-[var(--shadow)] md:grid-cols-5"
      >
        <Field label="الحالة">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">الكل</option>
            <option value="pending">معلّق</option>
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
            <option value="cancelled">ملغى</option>
          </Select>
        </Field>
        <Field label="الموظف">
          <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">الكل</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="من">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="إلى">
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            تطبيق التصفية
          </Button>
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <EmptyState title="لا توجد طلبات مطابقة" body="جرّب توسيع عوامل التصفية." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <table className="min-w-full text-right text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">الموظف</th>
                <th className="px-4 py-3 font-medium">النوع</th>
                <th className="px-4 py-3 font-medium">التواريخ</th>
                <th className="px-4 py-3 font-medium">الأيام</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const canAct = allowActions && (r.canReview ?? true) && r.status === 'pending';
                return (
                  <tr key={r.id} className="border-b border-[var(--line)] last:border-0 align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.employeeName}</p>
                      <p className="text-xs text-[var(--muted)]">{r.employeeEmail}</p>
                    </td>
                    <td className="px-4 py-3">{r.leaveTypeName}</td>
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
                      {canAct ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            className="!min-w-[4.75rem] !border !border-emerald-700 !bg-emerald-700 !px-3 !py-2 !text-white hover:!bg-emerald-800"
                            onClick={() => void approve(r.id)}
                          >
                            اعتماد
                          </Button>
                          <Button
                            variant="dangerSoft"
                            className="!min-w-[4.75rem] !px-3 !py-2"
                            onClick={() => setRejecting(r)}
                          >
                            رفض
                          </Button>
                        </div>
                      ) : (
                        <span className="inline-flex min-w-[4.75rem] items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
                          عرض فقط
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!rejecting} title="رفض طلب الإجازة" onClose={() => setRejecting(null)}>
        <div className="space-y-4">
          <Field label="سبب الرفض (اختياري)">
            <Textarea rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              إلغاء
            </Button>
            <Button variant="dangerSoft" onClick={() => void reject()}>
              تأكيد الرفض
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
