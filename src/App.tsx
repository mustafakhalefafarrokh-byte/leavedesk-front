import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { RequireAuth } from './components/RequireAuth';
import { RequirePermission } from './components/RequirePermission';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { BranchHeadsPage } from './pages/manager/BranchHeadsPage';
import { LeaveTypesPage } from './pages/manager/LeaveTypesPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MyRequestsPage } from './pages/employee/MyRequestsPage';
import { NewRequestPage } from './pages/employee/NewRequestPage';
import { EmployeeDetailPage } from './pages/shared/EmployeeDetailPage';
import { EmployeesPage } from './pages/shared/EmployeesPage';
import { RequestsPage } from './pages/shared/RequestsPage';
import { SupervisorDashboard } from './pages/shared/SupervisorDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      <Route element={<RequireAuth role="manager" />}>
        <Route element={<AppShell role="manager" />}>
          <Route
            path="/manager"
            element={
              <SupervisorDashboard
                title="لوحة المدير"
                requestsPath="/manager/requests-all"
                scope="all"
              />
            }
          />
          <Route
            path="/manager/requests-all"
            element={
              <RequestsPage
                title="كل طلبات النظام"
                subtitle="عرض وإحصائيات فقط لطلبات الفروع الأخرى. يمكنك اعتماد طلبات موظفيك من «طلبات فريقي»."
                endpoint="/api/leave-requests/all"
                allowActions
              />
            }
          />
          <Route
            path="/manager/requests-team"
            element={
              <RequestsPage
                title="طلبات فريقي"
                subtitle="اعتماد أو رفض طلبات الموظفين التابعين لك مباشرة."
                endpoint="/api/leave-requests/team"
                allowActions
              />
            }
          />
          <Route path="/manager/employees" element={<EmployeesPage detailBase="/manager/employees" />} />
          <Route
            path="/manager/employees/:id"
            element={<EmployeeDetailPage listPath="/manager/employees" canEditPermissions />}
          />
          <Route path="/manager/branch-heads" element={<BranchHeadsPage />} />
          <Route path="/manager/leave-types" element={<LeaveTypesPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth role="branch_head" />}>
        <Route element={<AppShell role="branch_head" />}>
          <Route
            path="/branch"
            element={
              <SupervisorDashboard title="لوحة رئيس الفرع" requestsPath="/branch/requests" scope="team" />
            }
          />
          <Route
            path="/branch/requests"
            element={
              <RequestsPage
                title="طلبات إجازات الفرع"
                subtitle="راجع طلبات موظفي فرعك واعتمدها أو ارفضها."
                endpoint="/api/leave-requests/team"
                allowActions
              />
            }
          />
          <Route path="/branch/employees" element={<EmployeesPage detailBase="/branch/employees" />} />
          <Route
            path="/branch/employees/:id"
            element={<EmployeeDetailPage listPath="/branch/employees" canEditPermissions />}
          />
        </Route>
      </Route>

      <Route element={<RequireAuth role="employee" />}>
        <Route element={<AppShell role="employee" />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/requests/new" element={<NewRequestPage />} />
          <Route path="/employee/requests" element={<MyRequestsPage />} />

          <Route
            element={
              <RequirePermission anyOf={['view_team_requests', 'approve_reject_requests']} />
            }
          >
            <Route
              path="/employee/team/requests"
              element={
                <RequestsPage
                  title="طلبات الفريق"
                  subtitle="عرض طلبات موظفي مديرك (حسب الصلاحيات الممنوحة لك)."
                  endpoint="/api/leave-requests/team"
                  allowActions
                />
              }
            />
          </Route>

          <Route element={<RequirePermission anyOf={['manage_employees']} />}>
            <Route
              path="/employee/team/employees"
              element={<EmployeesPage detailBase="/employee/team/employees" />}
            />
            <Route
              path="/employee/team/employees/:id"
              element={<EmployeeDetailPage listPath="/employee/team/employees" />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
