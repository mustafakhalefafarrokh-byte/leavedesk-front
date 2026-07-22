import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import type { Employee } from '../../api/types';
import { Alert, Button, Card, PageHeader, Spinner } from '../../components/ui';

export function EmployeeDetailPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api<{ employee: Employee }>(`/api/employees/${id}`);
      setEmployee(data.employee);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function regenerate() {
    if (!id) return;
    setError('');
    try {
      const data = await api<{ temporaryPassword: string }>(`/api/employees/${id}/regenerate-password`, {
        method: 'POST',
      });
      setTempPassword(data.temporaryPassword);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not regenerate password');
    }
  }

  if (loading) return <Spinner />;
  if (!employee) return <Alert>{error || 'Employee not found'}</Alert>;

  return (
    <div>
      <PageHeader
        title={employee.name}
        subtitle={employee.email}
        action={
          <Link to="/admin/employees" className="text-sm font-semibold text-[var(--brand)]">
            ← Back to employees
          </Link>
        }
      />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      {tempPassword ? (
        <div className="mb-4">
          <Alert tone="info">
            New temporary password: <strong>{tempPassword}</strong> (user must change it on next login)
          </Alert>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void regenerate()}>
          Regenerate password
        </Button>
        <span className="inline-flex items-center rounded-xl bg-[var(--surface)] px-3 py-2 text-sm">
          Status: {employee.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(employee.balances ?? []).map((b) => (
          <Card key={b.id}>
            <p className="font-semibold">{b.leaveTypeName}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-[var(--muted)]">Total</p>
                <p className="text-lg font-semibold">{b.totalDays}</p>
              </div>
              <div>
                <p className="text-[var(--muted)]">Used</p>
                <p className="text-lg font-semibold">{b.usedDays}</p>
              </div>
              <div>
                <p className="text-[var(--muted)]">Remaining</p>
                <p className="text-lg font-semibold text-[var(--brand-deep)]">{b.remainingDays}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
