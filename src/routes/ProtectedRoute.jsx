import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, role, getDefaultRoute } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
