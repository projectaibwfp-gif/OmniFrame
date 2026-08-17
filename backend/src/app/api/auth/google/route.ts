import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import {
  clearLoginState,
  isLoginStateValid,
  issueSessionCookie,
  type UserRole,
  upsertGoogleUser,
  verifyGoogleToken,
} from '@/lib/auth';

interface LoginPayload {
  credential?: string;
  state?: string;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return errorResponse('Request body must be valid JSON', 400);
  }

  const credential = payload.credential?.trim();
  if (!credential) {
    return errorResponse('credential is required', 400);
  }

  const state = payload.state?.trim();
  if (!state || !isLoginStateValid(request, state)) {
    const denied = errorResponse('Invalid login state', 403);
    clearLoginState(denied);
    return denied;
  }

  try {
    const googleToken = await verifyGoogleToken(credential);
    let sessionUser: {
      given_name: string | null;
      family_name: string | null;
      name: string | null;
      email: string;
      picture: string | null;
      role: UserRole;
    } = {
      given_name: googleToken.given_name ?? null,
      family_name: googleToken.family_name ?? null,
      name: googleToken.name ?? null,
      email: googleToken.email,
      picture: googleToken.picture ?? null,
      role: 'user',
    };

    try {
      const databaseUser = await upsertGoogleUser(googleToken);
      sessionUser = {
        given_name: databaseUser.given_name,
        family_name: databaseUser.family_name,
        name: databaseUser.name,
        email: databaseUser.email,
        picture: databaseUser.picture,
        role: databaseUser.role,
      };
    } catch (error) {
      console.warn('Could not sync Google user to database', error);
    }

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

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not authenticate Google user';
    console.error('Could not authenticate Google user', error);
    return errorResponse(message, 401);
  }
}
