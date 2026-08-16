import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { loadCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await loadCurrentUser(request);
    if (user instanceof NextResponse) {
      return user;
    }

    return NextResponse.json({ data: { user } });
  } catch (error) {
    console.error('Could not load current session', error);
    return errorResponse('Could not load current session', 500);
  }
}
