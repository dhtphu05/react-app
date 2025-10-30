import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { Loader2, Trello } from 'lucide-react';
import { APP_BASE_PATH, APP_BASE_PATH_WITH_SLASH } from '@/config/constants';

export function ProtectedRoute(): React.JSX.Element {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const rawFrom = `${location.pathname}${location.search}` || '/';
  const from = (() => {
    if (!APP_BASE_PATH) {
      return rawFrom.startsWith('/') ? rawFrom : `/${rawFrom}`;
    }

    if (rawFrom === APP_BASE_PATH || rawFrom === APP_BASE_PATH_WITH_SLASH) {
      return '/';
    }

    if (rawFrom.startsWith(`${APP_BASE_PATH}/`)) {
      const trimmed = rawFrom.slice(APP_BASE_PATH.length);
      return trimmed.length > 0 ? trimmed : '/';
    }

    return rawFrom.startsWith('/') ? rawFrom : `/${rawFrom}`;
  })();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-lg mb-4">
            <Trello className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-lg font-medium text-gray-700">Đang tải phiên làm việc...</span>
          </div>
          <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from }}
      />
    );
  }

  return <Outlet />;
}
