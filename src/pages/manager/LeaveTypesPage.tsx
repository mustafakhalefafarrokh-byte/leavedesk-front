import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../../api/client';
import type { LeaveType } from '../../api/types';
import {
  Alert,
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Spinner,
  TrashIcon,
} from '../../components/ui';

export function LeaveTypesPage() {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);
  const [typeName, setTypeName] = useState('');
  const [defaultDays, setDefaultDays] = useState(10);
  const [deleting, setDeleting] = useState<LeaveType | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

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

  async function confirmDelete() {
    if (!deleting) return;
    setError('');
    setSuccess('');
    setDeletingBusy(true);
    try {
      const result = await api<{ deleted: boolean; disabled?: boolean; message?: string }>(
        `/api/leave-types/${deleting.id}`,
        { method: 'DELETE' },
      );
      setSuccess(result.message ?? (result.deleted ? 'تم الحذف' : 'تم التعطيل'));
      setDeleting(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الحذف');
    } finally {
      setDeletingBusy(false);
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="secondary" className="!min-w-[4.5rem] !px-3 !py-2" onClick={() => openEdit(lt)}>
                        تعديل
                      </Button>
                      <Button
                        variant="secondary"
                        className={
                          lt.isActive
                            ? '!min-w-[4.5rem] !border-amber-200 !bg-amber-50 !px-3 !py-2 !text-amber-900 hover:!bg-amber-100'
                            : '!min-w-[4.5rem] !border-emerald-200 !bg-emerald-50 !px-3 !py-2 !text-emerald-800 hover:!bg-emerald-100'
                        }
                        onClick={() => void toggleActive(lt)}
                      >
                        {lt.isActive ? 'تعطيل' : 'تفعيل'}
                      </Button>
                      <Button
                        variant="dangerSoft"
                        className="!min-w-[4.5rem] !px-3 !py-2"
                        onClick={() => setDeleting(lt)}
                        title="حذف نوع الإجازة"
                        aria-label={`حذف ${lt.typeName}`}
                      >
                        <TrashIcon />
                        <span>حذف</span>
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

      <Modal open={!!deleting} title="تأكيد الحذف" onClose={() => !deletingBusy && setDeleting(null)}>
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/70 px-4 py-3 text-sm text-red-800">
            <TrashIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">حذف «{deleting?.typeName}»؟</p>
              <p className="mt-1 text-red-700/90">
                إن وُجدت طلبات أو أرصدة مستخدمة سيتم تعطيل النوع فقط للحفاظ على السجل التاريخي.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" disabled={deletingBusy} onClick={() => setDeleting(null)}>
              إلغاء
            </Button>
            <Button type="button" variant="dangerSoft" disabled={deletingBusy} onClick={() => void confirmDelete()}>
              <TrashIcon />
              {deletingBusy ? 'جارٍ الحذف…' : 'تأكيد الحذف'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
