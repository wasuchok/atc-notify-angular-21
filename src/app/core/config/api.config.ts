export const API_BASE_URL =
  (import.meta as any)?.env?.NG_APP_API_URL ||
  (import.meta as any)?.env?.NG_APP_API_BASE ||
  'http://10.17.3.244:3300/api/v1';

export const REFRESH_TOKEN_ENDPOINT = '/auth/refresh';
