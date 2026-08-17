import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { getPendingReferral, normalizeReferralCode, setPendingReferral } from '@/lib/referral';

interface CaptureReferralPayload {
  referralCode?: string;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: CaptureReferralPayload;

  try {
    payload = (await request.json()) as CaptureReferralPayload;
  } catch {
    return errorResponse('Request body must be valid JSON', 400);
  }

  const referralCode = normalizeReferralCode(payload.referralCode);
  if (!referralCode) {
    return errorResponse('referralCode must contain only letters, numbers, dots, underscores, or dashes', 400);
  }

  const existingReferral = getPendingReferral(request);
  const response = NextResponse.json(
    {
      data: {
        referralCode: existingReferral?.code ?? referralCode,
        stored: existingReferral === null,
      },
    },
    { status: 200 },
  );

  if (!existingReferral) {
    setPendingReferral(response, referralCode);
  }

  return response;
}
