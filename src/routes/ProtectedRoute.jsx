import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, role, loading, getDefaultRoute } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-gray-50" />;
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
