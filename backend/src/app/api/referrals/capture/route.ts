import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-response';
import { getPendingReferral, normalizeReferralCode, setPendingReferral } from '@/lib/referral';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

interface CaptureReferralPayload {
  referralCode?: string;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: CaptureReferralPayload;

  try {
    payload = (await request.json()) as CaptureReferralPayload;
  } catch (error) {
    logError('referrals.capture', ErrorCode.REQUEST_INVALID_JSON, {}, error);
    return errorResponse('Request body must be valid JSON', 400, ErrorCode.REQUEST_INVALID_JSON);
  }

  const referralCode = normalizeReferralCode(payload.referralCode);
  if (!referralCode) {
    return errorResponse(
      'referralCode must contain only letters, numbers, dots, underscores, or dashes',
      400,
      ErrorCode.VALIDATION_FAILED,
    );
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
