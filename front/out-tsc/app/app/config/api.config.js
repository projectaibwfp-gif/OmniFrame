// In production the Angular app and the API live on different Vercel origins
// (omniframe.vercel.app -> apiomniframe.vercel.app), so the build defaults to the
// backend origin. In dev the Vite proxy serves /api same-origin. Override either
// via VITE_API_BASE_URL.
const PROD_API_BASE_URL = 'https://apiomniframe.vercel.app/api';
const DEV_API_BASE_URL = '/api';
const DEFAULT_API_BASE_URL = import.meta.env.PROD ? PROD_API_BASE_URL : DEV_API_BASE_URL;
const configuredApiBaseUrl = import.meta.env['VITE_API_BASE_URL']?.trim();
export const API_BASE_URL = (configuredApiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
export function buildApiUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}
