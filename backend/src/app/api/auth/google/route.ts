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
    const user = await upsertGoogleUser(googleToken);
    const response = NextResponse.json({ data: { user } }, { status: 200 });

    await issueSessionCookie(response, { sub: googleToken.sub, email: googleToken.email });

    return response;
  } catch (error) {
    console.error('Could not authenticate Google user', error);
    return errorResponse('Could not authenticate Google user', 401);
  }
}
