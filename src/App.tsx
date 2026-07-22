import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { EmployeeDetailPage } from './pages/admin/EmployeeDetailPage';
import { EmployeesPage } from './pages/admin/EmployeesPage';
import { LeaveTypesPage } from './pages/admin/LeaveTypesPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MyRequestsPage } from './pages/employee/MyRequestsPage';
import { NewRequestPage } from './pages/employee/NewRequestPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      <Route element={<RequireAuth role="admin" />}>
        <Route element={<AppShell variant="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/leave-types" element={<LeaveTypesPage />} />
          <Route path="/admin/employees" element={<EmployeesPage />} />
          <Route path="/admin/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/admin/requests" element={<AdminRequestsPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth role="employee" />}>
        <Route element={<AppShell variant="employee" />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/requests/new" element={<NewRequestPage />} />
          <Route path="/employee/requests" element={<MyRequestsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
