import { STORAGE_REFRESH_KEY } from '@/config/constants';

type AccessTokenListener = (token: string | null) => void;

let accessToken: string | null = null;
const accessTokenListeners = new Set<AccessTokenListener>();

const isBrowser = (): boolean => typeof window !== 'undefined';

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
  accessTokenListeners.forEach((listener) => listener(accessToken));
};

export const subscribeAccessToken = (listener: AccessTokenListener): (() => void) => {
  accessTokenListeners.add(listener);
  return () => {
    accessTokenListeners.delete(listener);
  };
};

export const getRefreshToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }
  return window.localStorage.getItem(STORAGE_REFRESH_KEY);
};

export const setRefreshToken = (token: string): void => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(STORAGE_REFRESH_KEY, token);
};

export const clearTokens = (): void => {
  setAccessToken(null);
  if (isBrowser()) {
    window.localStorage.removeItem(STORAGE_REFRESH_KEY);
  }
};
