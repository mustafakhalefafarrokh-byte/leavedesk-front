import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../../api/client';
import type { BranchHead } from '../../api/types';
import { Alert, Button, EmptyState, Field, Input, Modal, PageHeader, Spinner } from '../../components/ui';

export function BranchHeadsPage() {
  const [items, setItems] = useState<BranchHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ branchHeads: BranchHead[] }>('/api/branch-heads');
      setItems(data.branchHeads);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل رؤساء الفروع');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const data = await api<{ branchHead: BranchHead; temporaryPassword: string }>('/api/branch-heads', {
        method: 'POST',
        body: JSON.stringify({
          name,
          username,
          email: email.trim() || undefined,
        }),
      });
      setTempPassword(data.temporaryPassword);
      setSuccess(`تم إنشاء ${data.branchHead.name}`);
      setName('');
      setUsername('');
      setEmail('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الإنشاء');
    }
  }

  async function toggleActive(bh: BranchHead) {
    try {
      await api(`/api/branch-heads/${bh.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !bh.isActive }),
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل التحديث');
    }
  }

  async function regenerate(id: string) {
    try {
      const data = await api<{ temporaryPassword: string }>(`/api/branch-heads/${id}/regenerate-password`, {
        method: 'POST',
      });
      setTempPassword(data.temporaryPassword);
      setSuccess('تم توليد كلمة مرور مؤقتة جديدة');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل إعادة التوليد');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="رؤساء فروع المحافظات"
        subtitle="المدير فقط ينشئ حسابات رؤساء الفروع."
        action={
          <Button
            onClick={() => {
              setOpen(true);
              setTempPassword('');
            }}
          >
            إضافة رئيس فرع
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
      {tempPassword ? (
        <div className="mb-4">
          <Alert tone="info">
            كلمة المرور المؤقتة: <strong>{tempPassword}</strong>
          </Alert>
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState title="لا يوجد رؤساء فروع" body="أضف رئيس فرع ليدير موظفي محافظته." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <table className="min-w-full text-right text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">الاسم</th>
                <th className="px-4 py-3 font-medium">اسم المستخدم</th>
                <th className="px-4 py-3 font-medium">البريد</th>
                <th className="px-4 py-3 font-medium">الموظفون</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((bh) => (
                <tr key={bh.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3 font-medium">{bh.name}</td>
                  <td className="px-4 py-3" dir="ltr">
                    {bh.username}
                  </td>
                  <td className="px-4 py-3">{bh.email || '—'}</td>
                  <td className="px-4 py-3">{bh.employeeCount ?? 0}</td>
                  <td className="px-4 py-3">{bh.isActive ? 'نشط' : 'موقوف'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" onClick={() => void toggleActive(bh)}>
                        {bh.isActive ? 'إيقاف' : 'تفعيل'}
                      </Button>
                      <Button variant="secondary" onClick={() => void regenerate(bh.id)}>
                        كلمة مرور جديدة
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="إضافة رئيس فرع" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={onCreate}>
          <Field label="الاسم">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="اسم المستخدم">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              dir="ltr"
              className="text-start"
            />
          </Field>
          <Field label="البريد الإلكتروني (اختياري)">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="text-start"
            />
          </Field>
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
