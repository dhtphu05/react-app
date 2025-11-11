import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { APP_BASE_PATH, APP_BASE_PATH_WITH_SLASH } from '@/config/constants';

export default function OAuthCallbackPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      try {
        setError(decodeURIComponent(errorParam));
      } catch {
        setError(errorParam);
      }
      return;
    }

    if (!accessToken || !refreshToken) {
      setError('Thiếu token từ callback.');
      return;
    }

    completeOAuthLogin({ accessToken, refreshToken })
      .then(() => {
        const redirectTarget = (() => {
          if (!redirectParam || !redirectParam.startsWith('/')) {
            return '/';
          }

          if (!APP_BASE_PATH) {
            return redirectParam;
          }

          if (
            redirectParam === APP_BASE_PATH ||
            redirectParam === APP_BASE_PATH_WITH_SLASH
          ) {
            return '/';
          }

          if (redirectParam.startsWith(`${APP_BASE_PATH}/`)) {
            const trimmed = redirectParam.slice(APP_BASE_PATH.length);
            return trimmed.length > 0 ? trimmed : '/';
          }

          return redirectParam;
        })();

        navigate(redirectTarget, { replace: true });
      })
      .catch(() => {
        setError('Xử lý callback thất bại, vui lòng thử lại.');
      });
  }, [
    accessToken,
    refreshToken,
    errorParam,
    redirectParam,
    completeOAuthLogin,
    navigate,
  ]);

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return <div className="p-6">Đang hoàn tất đăng nhập với Google...</div>;
}
