import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { DashboardRouteFallback } from '../components/PageSkeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, role, loading, getDefaultRoute } = useAuth();
  const location = useLocation();

  if (loading) {
    return <DashboardRouteFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
