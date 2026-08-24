import { NextRequest, NextResponse } from 'next/server';
import { fetchCharacter } from '@/lib/tibiadata';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const name = request.nextUrl.searchParams.get('name') || 'Barteeek';

  try {
    console.log(`[DEBUG] Fetching character: ${name}`);
    const character = await fetchCharacter(name);
    console.log(`[DEBUG] Character fetched:`, character);
    return NextResponse.json({ success: true, character });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(`[DEBUG] Error fetching character:`, message, stack);
    return NextResponse.json(
      { success: false, error: message, stack },
      { status: 500 },
    );
  }
}
