export const DEFAULT_GOOGLE_CLIENT_ID =
  "181921852616-kqff26dgukqpg5o46ulkik3ir2hcri4r.apps.googleusercontent.com";

export const DEFAULT_API_BASE_URL_DEV = "/api";
export const DEFAULT_API_BASE_URL_PROD = "https://apiomniframe.vercel.app/api";

export function resolveApiBaseUrl(
  configuredValue: string | undefined,
  isProd: boolean,
): string {
  const fallback = isProd
    ? DEFAULT_API_BASE_URL_PROD
    : DEFAULT_API_BASE_URL_DEV;
  return (configuredValue?.trim() || fallback).replace(/\/+$/, "");
}
