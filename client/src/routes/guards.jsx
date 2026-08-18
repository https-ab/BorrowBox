import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import Spinner from '../components/ui/Spinner';

/** Blocks unauthenticated access; remembers where the user wanted to go. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking your session..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}

/** Admin-only guard. */
export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Checking permissions..." />;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
