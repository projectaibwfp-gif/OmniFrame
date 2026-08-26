export const isProd =
  process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
export const cookieSameSite: 'none' | 'lax' = isProd ? 'none' : 'lax';
export const cookieSecure = isProd;
