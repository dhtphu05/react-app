const defaultApiBaseUrl = 'http://localhost:4000';
const rawBasePath = import.meta.env.BASE_URL ?? '/';
const normalizedBasePath = rawBasePath === '/' ? '' : rawBasePath.replace(/\/+$/, '');
const basePathWithTrailingSlash = normalizedBasePath ? `${normalizedBasePath}/` : '/';

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? defaultApiBaseUrl;

export const OAUTH_CALLBACK_PATH = '/oauth/callback';

export const APP_BASE_PATH = normalizedBasePath;

export const APP_BASE_PATH_WITH_SLASH = basePathWithTrailingSlash;

export const STORAGE_REFRESH_KEY = '__app_refresh_token';
