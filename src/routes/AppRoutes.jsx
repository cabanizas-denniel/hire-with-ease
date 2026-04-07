import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

const LandingPage = lazy(() => import('../pages/public/LandingPage.jsx'));
const LoginPage = lazy(() => import('../pages/public/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../pages/public/RegisterPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/shared/NotFoundPage.jsx'));

const ApplicantDashboardPage = lazy(() => import('../pages/applicant/ApplicantDashboardPage.jsx'));
const ApplicantProfilePage = lazy(() => import('../pages/applicant/ApplicantProfilePage.jsx'));
const ApplicantJobsPage = lazy(() => import('../pages/applicant/ApplicantJobsPage.jsx'));
const ApplicantApplicationsPage = lazy(() => import('../pages/applicant/ApplicantApplicationsPage.jsx'));
const ApplicantNotificationsPage = lazy(() => import('../pages/applicant/ApplicantNotificationsPage.jsx'));

const EmployerDashboardPage = lazy(() => import('../pages/employer/EmployerDashboardPage.jsx'));
const EmployerPostJobPage = lazy(() => import('../pages/employer/EmployerPostJobPage.jsx'));
const EmployerJobsPage = lazy(() => import('../pages/employer/EmployerJobsPage.jsx'));
const EmployerCandidatesPage = lazy(() => import('../pages/employer/EmployerCandidatesPage.jsx'));
const EmployerHiredPage = lazy(() => import('../pages/employer/EmployerHiredPage.jsx'));

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage.jsx'));
const AdminWorkersPage = lazy(() => import('../pages/admin/AdminWorkersPage.jsx'));
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage.jsx'));

function RoleLayout({ role }) {
  return (
    <DashboardLayout role={role}>
      <Outlet />
    </DashboardLayout>
  );
}

function AppRoutes() {
  const { isAuthenticated, getDefaultRoute } = useAuth();

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50"></div>}>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute allowedRole="applicant" />}>
          <Route path="/applicant" element={<RoleLayout role="applicant" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ApplicantDashboardPage />} />
            <Route path="profile" element={<ApplicantProfilePage />} />
            <Route path="jobs" element={<ApplicantJobsPage />} />
            <Route path="applications" element={<ApplicantApplicationsPage />} />
            <Route path="notifications" element={<ApplicantNotificationsPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="employer" />}>
          <Route path="/employer" element={<RoleLayout role="employer" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployerDashboardPage />} />
            <Route path="post-job" element={<EmployerPostJobPage />} />
            <Route path="jobs" element={<EmployerJobsPage />} />
            <Route path="candidates/:jobId" element={<EmployerCandidatesPage />} />
            <Route path="hired" element={<EmployerHiredPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<RoleLayout role="admin" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="workers" element={<AdminWorkersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
