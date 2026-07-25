import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../../api/client';
import type { LeaveType } from '../../api/types';
import { Alert, Button, EmptyState, Field, Input, Modal, PageHeader, Spinner } from '../../components/ui';

export function LeaveTypesPage() {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);
  const [typeName, setTypeName] = useState('');
  const [defaultDays, setDefaultDays] = useState(10);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api<{ leaveTypes: LeaveType[] }>('/api/leave-types');
      setTypes(data.leaveTypes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل أنواع الإجازات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditing(null);
    setTypeName('');
    setDefaultDays(10);
    setOpen(true);
  }

  function openEdit(lt: LeaveType) {
    setEditing(lt);
    setTypeName(lt.typeName);
    setDefaultDays(lt.defaultDays);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editing) {
        await api(`/api/leave-types/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ typeName, defaultDays }),
        });
        setSuccess('تم تحديث نوع الإجازة');
      } else {
        await api('/api/leave-types', {
          method: 'POST',
          body: JSON.stringify({ typeName, defaultDays }),
        });
        setSuccess('تم إنشاء نوع الإجازة — خصّصه للموظفين عند الإضافة أو التعديل');
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الحفظ');
    }
  }

  async function toggleActive(lt: LeaveType) {
    setError('');
    setSuccess('');
    try {
      await api(`/api/leave-types/${lt.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !lt.isActive }),
      });
      setSuccess(lt.isActive ? 'تم تعطيل نوع الإجازة' : 'تم تفعيل نوع الإجازة');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل التحديث');
    }
  }

  async function removeType(lt: LeaveType) {
    if (
      !confirm(
        `هل تريد حذف «${lt.typeName}»؟\nإن وُجدت طلبات أو أرصدة مستخدمة سيتم التعطيل فقط للحفاظ على السجل.`,
      )
    ) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const result = await api<{ deleted: boolean; disabled?: boolean; message?: string }>(
        `/api/leave-types/${lt.id}`,
        { method: 'DELETE' },
      );
      setSuccess(result.message ?? (result.deleted ? 'تم الحذف' : 'تم التعطيل'));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الحذف');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="أنواع الإجازات"
        subtitle="يُنشئها المدير فقط. الحذف النهائي متاح إن لم تُستخدم؛ وإلا يُعطَّل النوع."
        action={<Button onClick={openCreate}>إضافة نوع</Button>}
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

      {types.length === 0 ? (
        <EmptyState title="لا توجد أنواع بعد" body="أنشئ أنواعاً مثل الإجازة السنوية أو المرضية." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <table className="min-w-full text-right text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">الاسم</th>
                <th className="px-4 py-3 font-medium">الأيام الافتراضية</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {types.map((lt) => (
                <tr key={lt.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3 font-medium">{lt.typeName}</td>
                  <td className="px-4 py-3">{lt.defaultDays}</td>
                  <td className="px-4 py-3">{lt.isActive ? 'نشط' : 'معطّل'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => openEdit(lt)}>
                        تعديل
                      </Button>
                      <Button variant="ghost" onClick={() => void toggleActive(lt)}>
                        {lt.isActive ? 'تعطيل' : 'تفعيل'}
                      </Button>
                      <Button variant="danger" onClick={() => void removeType(lt)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title={editing ? 'تعديل نوع الإجازة' : 'نوع إجازة جديد'} onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="الاسم">
            <Input value={typeName} onChange={(e) => setTypeName(e.target.value)} required />
          </Field>
          <Field label="الأيام الافتراضية">
            <Input
              type="number"
              min={0}
              max={365}
              value={defaultDays}
              onChange={(e) => setDefaultDays(Number(e.target.value))}
              required
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
