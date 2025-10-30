import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from './api';
import type { User } from './types';
import {
  clearTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  subscribeAccessToken,
} from './tokenStore';
import {
  API_BASE_URL,
  APP_BASE_PATH,
  APP_BASE_PATH_WITH_SLASH,
  OAUTH_CALLBACK_PATH,
} from '@/config/constants';

const oauthCallbackPath = `${APP_BASE_PATH}${OAUTH_CALLBACK_PATH}`;

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string) => Promise<User>;
  signOut: () => Promise<void>;
  loginWithGoogle: (options?: { redirect?: string }) => void;
  completeOAuthLogin: (params: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          return;
        }

        const refreshed = await authApi.refresh(refreshToken);
        if (!active) {
          return;
        }

        setAccessToken(refreshed.accessToken);
        setRefreshToken(refreshed.refreshToken);

        const me = await authApi.me();
        if (!active) {
          return;
        }

        setUser(me);
      } catch {
        if (active) {
          clearTokens();
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    const unsubscribe = subscribeAccessToken((token) => {
      if (!token && active) {
        setUser(null);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string) => {
    const login = await authApi.login(email.trim());
    setAccessToken(login.accessToken);
    setRefreshToken(login.refreshToken);
    setUser(login.user);
    return login.user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors; session will be cleared regardless.
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const loginWithGoogle = useCallback((options?: { redirect?: string }) => {
    if (typeof window === 'undefined') {
      return;
    }

    const callbackUrl = `${window.location.origin}${oauthCallbackPath}`;
    const inAppRedirect = options?.redirect?.startsWith('/') ? options.redirect : '/';
    const redirectForBackend = APP_BASE_PATH
      ? inAppRedirect === '/'
        ? APP_BASE_PATH_WITH_SLASH
        : `${APP_BASE_PATH}${inAppRedirect}`
      : inAppRedirect;

    const searchParams = new URLSearchParams();
    searchParams.set('redirect_uri', callbackUrl);
    searchParams.set('redirect', redirectForBackend);

    try {
      const url = new URL('/auth/google', API_BASE_URL || window.location.origin);
      url.search = searchParams.toString();
      window.location.href = url.toString();
    } catch {
      window.location.href = `${API_BASE_URL}/auth/google?${searchParams.toString()}`;
    }
  }, []);

  const completeOAuthLogin = useCallback(
    async ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      try {
        const me = await authApi.me();
        setUser(me);
        return me;
      } catch (error) {
        clearTokens();
        throw error;
      }
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
      loginWithGoogle,
      completeOAuthLogin,
    }),
    [completeOAuthLogin, isLoading, loginWithGoogle, signIn, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
