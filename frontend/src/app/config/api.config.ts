import { resolveApiBaseUrl } from '@shared/runtime-config';

// In production the Angular app and the API live on different Vercel origins
// (omniframe.vercel.app -> apiomniframe.vercel.app), so the build defaults to the
// backend origin. In dev the Vite proxy serves /api same-origin. Override via
// VITE_API_BASE_URL.
const configuredApiBaseUrl = import.meta.env['VITE_API_BASE_URL'];

export const API_BASE_URL = resolveApiBaseUrl(configuredApiBaseUrl, import.meta.env.PROD);

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
