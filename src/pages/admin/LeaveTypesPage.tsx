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
      setError(err instanceof ApiError ? err.message : 'Failed to load leave types');
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
        setSuccess('Leave type updated');
      } else {
        await api('/api/leave-types', {
          method: 'POST',
          body: JSON.stringify({ typeName, defaultDays }),
        });
        setSuccess('Leave type created — balances added for all employees');
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed');
    }
  }

  async function toggleActive(lt: LeaveType) {
    setError('');
    try {
      if (lt.isActive) {
        await api(`/api/leave-types/${lt.id}`, { method: 'DELETE' });
        setSuccess(lt.isActive ? 'Leave type disabled (kept for history)' : 'Updated');
      } else {
        await api(`/api/leave-types/${lt.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ isActive: true }),
        });
        setSuccess('Leave type reactivated');
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Leave types"
        subtitle="Define policies and default annual balances. Editing default days does not rewrite existing balances."
        action={<Button onClick={openCreate}>Add leave type</Button>}
      />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      {success ? <div className="mb-4"><Alert tone="success">{success}</Alert></div> : null}

      {types.length === 0 ? (
        <EmptyState title="No leave types yet" body="Create Annual, Sick, or custom leave categories." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Default days</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((lt) => (
                <tr key={lt.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3 font-medium">{lt.typeName}</td>
                  <td className="px-4 py-3">{lt.defaultDays}</td>
                  <td className="px-4 py-3">{lt.isActive ? 'Active' : 'Disabled'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => openEdit(lt)}>
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => void toggleActive(lt)}>
                        {lt.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title={editing ? 'Edit leave type' : 'New leave type'} onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="Name">
            <Input value={typeName} onChange={(e) => setTypeName(e.target.value)} required />
          </Field>
          <Field label="Default days">
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
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
