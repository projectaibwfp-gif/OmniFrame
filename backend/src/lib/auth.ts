export type { AuthCheckResult, GoogleTokenPayload, SessionTokenPayload, UserRole } from './auth-session';
export type { AuthenticatedUser, UpsertUserInput, UpsertUserResult } from './auth-users';

export {
  clearLoginState,
  clearSessionCookie,
  isAuthDenied,
  isLoginStateValid,
  refreshSessionCookie,
  requireAuth,
  signSessionToken,
  storeLoginState,
  toSessionPayload,
  verifyGoogleToken,
  verifySessionToken,
} from './auth-session';

export { issueSessionCookie } from './auth-google';
export { createLoginState } from './auth-google';
export { loadCurrentUser, upsertGoogleUser, upsertUser } from './auth-users';
