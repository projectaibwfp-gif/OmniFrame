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
import { HttpStatus } from '@/lib/http-status';
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
    const denied = errorResponse(
      'Invalid login state',
      HttpStatus.FORBIDDEN,
      ErrorCode.AUTH_INVALID_LOGIN_STATE,
    );
    clearLoginState(denied);
    return denied;
  }

  let googleToken: GoogleTokenPayload;
  try {
    googleToken = await verifyGoogleToken(credential);
  } catch (error) {
    logError('auth.google', ErrorCode.AUTH_GOOGLE_TOKEN_INVALID, {}, error);
    return errorResponse(
      'Could not verify Google token',
      HttpStatus.UNAUTHORIZED,
      ErrorCode.AUTH_GOOGLE_TOKEN_INVALID,
    );
  }

  try {
    const pendingReferral = getPendingReferral(request);
    const { user: databaseUser, sessionVersion } = await upsertGoogleUser(
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
      { status: HttpStatus.OK },
    );

    await issueSessionCookie(response, googleToken, sessionVersion);
    clearLoginState(response);
    clearPendingReferral(response);

    return response;
  } catch (error) {
    logError('auth.google', ErrorCode.AUTH_USER_UPSERT_FAILED, { sub: googleToken.sub }, error);
    return errorResponse(
      'Could not complete Google login',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.AUTH_USER_UPSERT_FAILED,
    );
  }
}
