import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export function ProtectedRoute() {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  // If no token exists in Redux or localStorage, kick them to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}