import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { clearPendingReferral, getPendingReferral } from '@/lib/referral';
import {
  clearLoginState,
  isLoginStateValid,
  issueSessionCookie,
  type UserRole,
  upsertGoogleUser,
  verifyGoogleToken,
} from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

interface LoginPayload {
  credential?: string;
  state?: string;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch (error) {
    logError('auth.google', ErrorCode.REQUEST_INVALID_JSON, {}, error);
    return errorResponse('Request body must be valid JSON', 400, ErrorCode.REQUEST_INVALID_JSON);
  }

  const credential = payload.credential?.trim();
  if (!credential) {
    logError('auth.google', ErrorCode.VALIDATION_FAILED, { reason: 'missing credential' });
    return errorResponse('credential is required', 400, ErrorCode.VALIDATION_FAILED);
  }

  const state = payload.state?.trim();
  if (!state || !isLoginStateValid(request, state)) {
    logError('auth.google', ErrorCode.AUTH_INVALID_LOGIN_STATE, {
      hasState: Boolean(state),
    });
    const denied = errorResponse('Invalid login state', 403, ErrorCode.AUTH_INVALID_LOGIN_STATE);
    clearLoginState(denied);
    return denied;
  }

  let googleToken;
  try {
    googleToken = await verifyGoogleToken(credential);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not verify Google token';
    logError('auth.google', ErrorCode.AUTH_GOOGLE_TOKEN_INVALID, {}, error);
    return errorResponse(message, 401, ErrorCode.AUTH_GOOGLE_TOKEN_INVALID);
  }

  try {
    const pendingReferral = getPendingReferral(request);
    const { user: databaseUser } = await upsertGoogleUser(
      googleToken,
      pendingReferral?.code ?? null,
    );
    const sessionUser: {
      given_name: string | null;
      family_name: string | null;
      name: string | null;
      email: string;
      picture: string | null;
      role: UserRole;
      referralCode: string;
      referredByCode: string | null;
    } = {
      given_name: databaseUser.given_name,
      family_name: databaseUser.family_name,
      name: databaseUser.name,
      email: databaseUser.email,
      picture: databaseUser.picture,
      role: databaseUser.role,
      referralCode: databaseUser.referralCode,
      referredByCode: databaseUser.referredByCode,
    };

    const response = NextResponse.json(
      {
        data: {
          user: sessionUser,
        },
      },
      { status: 200 },
    );

    await issueSessionCookie(response, credential);
    clearLoginState(response);
    clearPendingReferral(response);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not complete Google login';
    logError(
      'auth.google',
      ErrorCode.AUTH_USER_UPSERT_FAILED,
      { sub: googleToken.sub, email: googleToken.email },
      error,
    );
    return errorResponse(message, 500, ErrorCode.AUTH_USER_UPSERT_FAILED);
  }
}
