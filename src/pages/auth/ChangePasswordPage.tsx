import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../../api/client';
import type { User } from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import { Alert, Button, Card, Field, Input, PageHeader } from '../../components/ui';

export function ChangePasswordPage() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !user) return <Navigate to="/login" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await api<{ user: User }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setUser(data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <PageHeader title="Update password" subtitle="You must set a new password before continuing." />
      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="Current password">
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </Field>
          {error ? <Alert>{error}</Alert> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
