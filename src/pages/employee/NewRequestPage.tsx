import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import type { Balance } from '../../api/types';
import { Alert, Button, Card, Field, Input, PageHeader, Select, Textarea } from '../../components/ui';
import { calculateLeaveDays, todayDateInputValue } from '../../lib/leaveDays';

export function NewRequestPage() {
  const navigate = useNavigate();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState(todayDateInputValue());
  const [endDate, setEndDate] = useState(todayDateInputValue());
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const b = await api<{ balances: Balance[] }>('/api/balances/me');
        setBalances(b.balances);
        if (b.balances[0]) setLeaveTypeId(b.balances[0].leaveTypeId);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'فشل تحميل البيانات');
      }
    })();
  }, []);

  const days = useMemo(() => calculateLeaveDays(startDate, endDate), [startDate, endDate]);
  const remaining = balances.find((b) => b.leaveTypeId === leaveTypeId)?.remainingDays ?? 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api('/api/leave-requests', {
        method: 'POST',
        body: JSON.stringify({
          leaveTypeId,
          startDate,
          endDate,
          reason: reason.trim() || undefined,
        }),
      });
      navigate('/employee/requests');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذّر إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="طلب إجازة جديد"
        subtitle="تُحسب أيام العمل تلقائياً. تظهر فقط الأنواع المخصصة لك."
      />
      <Card className="max-w-xl">
        {balances.length === 0 ? (
          <Alert>لا توجد أنواع إجازات مخصصة لحسابك. تواصل مع مسؤولك.</Alert>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="نوع الإجازة">
              <Select value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} required>
                {balances.map((t) => (
                  <option key={t.leaveTypeId} value={t.leaveTypeId}>
                    {t.leaveTypeName}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="من تاريخ">
                <Input
                  type="date"
                  value={startDate}
                  min={todayDateInputValue()}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </Field>
              <Field label="إلى تاريخ">
                <Input
                  type="date"
                  value={endDate}
                  min={startDate || todayDateInputValue()}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </Field>
            </div>
            <Field label="السبب (اختياري)">
              <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>

            <div className="rounded-xl bg-[var(--surface)] px-4 py-3 text-sm">
              <p>
                أيام العمل المطلوبة: <strong>{days}</strong>
              </p>
              <p className="mt-1 text-[var(--muted)]">
                المتبقي للنوع المحدد: <strong>{remaining}</strong>
              </p>
            </div>

            {error ? <Alert>{error}</Alert> : null}
            {days <= 0 ? <Alert tone="info">اختر نطاقاً يتضمن يوم عمل واحداً على الأقل.</Alert> : null}
            {days > remaining ? <Alert>الأيام المطلوبة تتجاوز رصيدك المتبقي.</Alert> : null}

            <Button type="submit" disabled={submitting || days <= 0 || days > remaining}>
              {submitting ? 'جارٍ الإرسال…' : 'إرسال الطلب'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
