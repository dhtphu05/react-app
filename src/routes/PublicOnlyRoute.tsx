import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { APP_BASE_PATH, APP_BASE_PATH_WITH_SLASH } from '@/config/constants';

export function PublicOnlyRoute(): JSX.Element {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-6">Đang tải phiên làm việc...</div>;
  }

  if (isAuthenticated) {
    const rawDestination = (location.state as { from?: string } | null)?.from;
    const destination = (() => {
      if (!rawDestination || !rawDestination.startsWith('/')) {
        return '/';
      }

      if (!APP_BASE_PATH) {
        return rawDestination;
      }

      if (
        rawDestination === APP_BASE_PATH ||
        rawDestination === APP_BASE_PATH_WITH_SLASH
      ) {
        return '/';
      }

      if (rawDestination.startsWith(`${APP_BASE_PATH}/`)) {
        const trimmed = rawDestination.slice(APP_BASE_PATH.length);
        return trimmed.length > 0 ? trimmed : '/';
      }

      return rawDestination;
    })();
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
