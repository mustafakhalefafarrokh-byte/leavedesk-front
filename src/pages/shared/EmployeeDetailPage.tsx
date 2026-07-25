import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import type { Employee, LeaveType } from '../../api/types';
import { Alert, Button, Card, PageHeader, Spinner } from '../../components/ui';

export function EmployeeDetailPage({ listPath }: { listPath: string }) {
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const [empData, typesData] = await Promise.all([
        api<{ employee: Employee }>(`/api/employees/${id}`),
        api<{ leaveTypes: LeaveType[] }>('/api/leave-types/active'),
      ]);
      setEmployee(empData.employee);
      setLeaveTypes(typesData.leaveTypes);
      setSelectedTypes(empData.employee.leaveTypeIds ?? empData.employee.balances?.map((b) => b.leaveTypeId) ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل الموظف');
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
      setError(err instanceof ApiError ? err.message : 'تعذّر إعادة توليد كلمة المرور');
    }
  }

  async function saveTypes() {
    if (!id) return;
    setError('');
    setSuccess('');
    try {
      await api(`/api/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ leaveTypeIds: selectedTypes }),
      });
      setSuccess('تم تحديث أنواع الإجازات');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الحفظ');
    }
  }

  if (loading) return <Spinner />;
  if (!employee) return <Alert>{error || 'الموظف غير موجود'}</Alert>;

  return (
    <div>
      <PageHeader
        title={employee.name}
        subtitle={employee.email}
        action={
          <Link to={listPath} className="text-sm font-semibold text-[var(--brand)]">
            ← العودة للموظفين
          </Link>
        }
      />
      {error ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {success ? (
        <div className="mb-4">
          <Alert tone="success">{success}</Alert>
        </div>
      ) : null}
      {tempPassword ? (
        <div className="mb-4">
          <Alert tone="info">
            كلمة المرور المؤقتة الجديدة: <strong>{tempPassword}</strong>
          </Alert>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void regenerate()}>
          إعادة توليد كلمة المرور
        </Button>
        <span className="inline-flex items-center rounded-xl bg-[var(--surface)] px-3 py-2 text-sm">
          الحالة: {employee.isActive ? 'نشط' : 'موقوف'}
        </span>
      </div>

      <Card className="mb-6">
        <p className="mb-3 font-semibold">أنواع الإجازات المخصصة</p>
        <div className="space-y-2">
          {leaveTypes.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedTypes.includes(t.id)}
                onChange={() =>
                  setSelectedTypes((prev) =>
                    prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id],
                  )
                }
              />
              <span>
                {t.typeName} ({t.defaultDays} يوم)
              </span>
            </label>
          ))}
        </div>
        <Button className="mt-4" onClick={() => void saveTypes()}>
          حفظ الأنواع
        </Button>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {(employee.balances ?? []).map((b) => (
          <Card key={b.id}>
            <p className="font-semibold">{b.leaveTypeName}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-[var(--muted)]">الإجمالي</p>
                <p className="text-lg font-semibold">{b.totalDays}</p>
              </div>
              <div>
                <p className="text-[var(--muted)]">المستخدم</p>
                <p className="text-lg font-semibold">{b.usedDays}</p>
              </div>
              <div>
                <p className="text-[var(--muted)]">المتبقي</p>
                <p className="text-lg font-semibold text-[var(--brand-deep)]">{b.remainingDays}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
