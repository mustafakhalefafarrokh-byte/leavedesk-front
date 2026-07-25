import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import type { Employee, LeaveType } from '../../api/types';
import { Alert, Button, EmptyState, Field, Input, Modal, PageHeader, Spinner } from '../../components/ui';

export function EmployeesPage({ detailBase }: { detailBase: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [tempPassword, setTempPassword] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [empData, typesData] = await Promise.all([
        api<{ employees: Employee[] }>('/api/employees'),
        api<{ leaveTypes: LeaveType[] }>('/api/leave-types/active'),
      ]);
      setEmployees(empData.employees);
      setLeaveTypes(typesData.leaveTypes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل الموظفين');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function toggleType(id: string) {
    setSelectedTypes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (selectedTypes.length === 0) {
      setError('يجب اختيار نوع إجازة واحد على الأقل');
      return;
    }
    try {
      const data = await api<{ employee: Employee; temporaryPassword: string }>('/api/employees', {
        method: 'POST',
        body: JSON.stringify({ name, email, leaveTypeIds: selectedTypes }),
      });
      setTempPassword(data.temporaryPassword);
      setSuccess(`تم إنشاء ${data.employee.name}. شارك كلمة المرور المؤقتة بأمان.`);
      setName('');
      setEmail('');
      setSelectedTypes([]);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الإنشاء');
    }
  }

  async function toggleActive(emp: Employee) {
    try {
      await api(`/api/employees/${emp.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !emp.isActive }),
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل التحديث');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="الموظفون"
        subtitle="أضف موظفيك وخصص أنواع الإجازات التي يمكنهم طلبها."
        action={
          <Button
            onClick={() => {
              setOpen(true);
              setTempPassword('');
            }}
          >
            إضافة موظف
          </Button>
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

      {employees.length === 0 ? (
        <EmptyState title="لا يوجد موظفون بعد" body="أضف أول موظف لبدء تتبع الإجازات." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <table className="min-w-full text-right text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">الاسم</th>
                <th className="px-4 py-3 font-medium">البريد</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3 font-medium">{emp.name}</td>
                  <td className="px-4 py-3">{emp.email}</td>
                  <td className="px-4 py-3">{emp.isActive ? 'نشط' : 'موقوف'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`${detailBase}/${emp.id}`}
                        className="inline-flex rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold hover:bg-[var(--surface)]"
                      >
                        عرض
                      </Link>
                      <Button variant="ghost" onClick={() => void toggleActive(emp)}>
                        {emp.isActive ? 'إيقاف' : 'تفعيل'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="إضافة موظف" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={onCreate}>
          <Field label="الاسم الكامل">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="البريد الإلكتروني">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <div>
            <p className="mb-2 text-sm font-medium">أنواع الإجازات المسموحة</p>
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-[var(--line)] p-3">
              {leaveTypes.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t.id)}
                    onChange={() => toggleType(t.id)}
                  />
                  <span>
                    {t.typeName} ({t.defaultDays} يوم)
                  </span>
                </label>
              ))}
            </div>
          </div>
          {tempPassword ? (
            <Alert tone="info">
              كلمة المرور المؤقتة: <strong>{tempPassword}</strong>
            </Alert>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              إغلاق
            </Button>
            <Button type="submit">إنشاء</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
