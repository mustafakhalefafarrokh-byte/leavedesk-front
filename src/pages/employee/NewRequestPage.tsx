import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import type { Balance, LeaveType } from '../../api/types';
import { Alert, Button, Card, Field, Input, PageHeader, Select, Textarea } from '../../components/ui';
import { calculateLeaveDays, todayDateInputValue } from '../../lib/leaveDays';

export function NewRequestPage() {
  const navigate = useNavigate();
  const [types, setTypes] = useState<LeaveType[]>([]);
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
        const [t, b] = await Promise.all([
          api<{ leaveTypes: LeaveType[] }>('/api/leave-types/active'),
          api<{ balances: Balance[] }>('/api/balances/me'),
        ]);
        setTypes(t.leaveTypes);
        setBalances(b.balances);
        if (t.leaveTypes[0]) setLeaveTypeId(t.leaveTypes[0].id);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load form data');
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
      setError(err instanceof ApiError ? err.message : 'Could not submit request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="New leave request"
        subtitle="Working days are calculated automatically. Weekends are excluded."
      />
      <Card className="max-w-xl">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="Leave type">
            <Select value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} required>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.typeName}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <Input type="date" value={startDate} min={todayDateInputValue()} onChange={(e) => setStartDate(e.target.value)} required />
            </Field>
            <Field label="End date">
              <Input type="date" value={endDate} min={startDate || todayDateInputValue()} onChange={(e) => setEndDate(e.target.value)} required />
            </Field>
          </div>
          <Field label="Reason (optional)">
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>

          <div className="rounded-xl bg-[var(--surface)] px-4 py-3 text-sm">
            <p>
              Requested working days: <strong>{days}</strong>
            </p>
            <p className="mt-1 text-[var(--muted)]">
              Remaining for selected type: <strong>{remaining}</strong>
            </p>
          </div>

          {error ? <Alert>{error}</Alert> : null}
          {days <= 0 ? <Alert tone="info">Select a range that includes at least one weekday.</Alert> : null}
          {days > remaining ? <Alert>Requested days exceed your remaining balance.</Alert> : null}

          <Button type="submit" disabled={submitting || days <= 0 || days > remaining}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
