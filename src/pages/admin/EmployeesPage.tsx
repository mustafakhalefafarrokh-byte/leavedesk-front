import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import type { Employee } from '../../api/types';
import { Alert, Button, EmptyState, Field, Input, Modal, PageHeader, Spinner } from '../../components/ui';

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ employees: Employee[] }>('/api/employees');
      setEmployees(data.employees);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load employees');
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
      const data = await api<{ employee: Employee; temporaryPassword: string }>('/api/employees', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
      });
      setTempPassword(data.temporaryPassword);
      setSuccess(`Created ${data.employee.name}. Share the temporary password securely.`);
      setName('');
      setEmail('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Create failed');
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
      setError(err instanceof ApiError ? err.message : 'Update failed');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Create accounts, manage access, and inspect leave balances."
        action={<Button onClick={() => { setOpen(true); setTempPassword(''); }}>Add employee</Button>}
      />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      {success ? <div className="mb-4"><Alert tone="success">{success}</Alert></div> : null}

      {employees.length === 0 ? (
        <EmptyState title="No employees yet" body="Add your first employee to start leave tracking." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3 font-medium">{emp.name}</td>
                  <td className="px-4 py-3">{emp.email}</td>
                  <td className="px-4 py-3">{emp.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/employees/${emp.id}`}
                        className="inline-flex rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-semibold hover:bg-[var(--surface)]"
                      >
                        View
                      </Link>
                      <Button variant="ghost" onClick={() => void toggleActive(emp)}>
                        {emp.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="Add employee" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={onCreate}>
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          {tempPassword ? (
            <Alert tone="info">
              Temporary password: <strong>{tempPassword}</strong>
            </Alert>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
