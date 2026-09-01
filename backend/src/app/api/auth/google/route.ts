import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, AuthGoogleResponseDto, AuthGoogleUserDto } from '@shared/api-contract';
import { AuthGoogleRequestSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/request-validation';
import { clearPendingReferral, getPendingReferral } from '@/lib/referral';
import {
  clearLoginState,
  isLoginStateValid,
  issueSessionCookie,
  upsertGoogleUser,
  verifyGoogleToken,
} from '@/lib/auth';
import type { GoogleTokenPayload } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const validation = await parseJsonBody(request, AuthGoogleRequestSchema, {
    scope: 'auth.google.login',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const { credential, state } = validation.data;

  if (!isLoginStateValid(request, state)) {
    logError('auth.google', ErrorCode.AUTH_INVALID_LOGIN_STATE, {
      hasState: true,
    });
    const denied = errorResponse('Invalid login state', 403, ErrorCode.AUTH_INVALID_LOGIN_STATE);
    clearLoginState(denied);
    return denied;
  }

  let googleToken: GoogleTokenPayload;
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
    const sessionUser: AuthGoogleUserDto = {
      givenName: databaseUser.givenName,
      familyName: databaseUser.familyName,
      name: databaseUser.name,
      email: databaseUser.email,
      picture: databaseUser.picture,
      role: databaseUser.role,
      referralCode: databaseUser.referralCode,
      referredByCode: databaseUser.referredByCode,
    };

    const response = NextResponse.json<ApiResponse<AuthGoogleResponseDto>>(
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
