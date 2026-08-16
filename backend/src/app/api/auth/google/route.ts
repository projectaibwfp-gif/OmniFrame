import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { issueSessionCookie, upsertGoogleUser, verifyGoogleToken } from '@/lib/auth';

interface LoginPayload {
  credential?: string;
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

  try {
    const googleToken = await verifyGoogleToken(credential);
    let sessionUser = {
      given_name: googleToken.given_name ?? null,
      family_name: googleToken.family_name ?? null,
      name: googleToken.name ?? null,
      role: 'user' as const,
    };

    try {
      const databaseUser = await upsertGoogleUser(googleToken);
      sessionUser = {
        given_name: databaseUser.given_name,
        family_name: databaseUser.family_name,
        name: databaseUser.name,
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

    await issueSessionCookie(response, {
      sub: googleToken.sub,
      email: googleToken.email,
      role: sessionUser.role,
      name: sessionUser.name,
      given_name: sessionUser.given_name,
      family_name: sessionUser.family_name,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not authenticate Google user';
    console.error('Could not authenticate Google user', error);
    return errorResponse(message, 401);
  }
}
