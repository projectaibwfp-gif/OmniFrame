import { NextRequest, NextResponse } from 'next/server';
import type {
  ApiResponse,
  ReferralCaptureRequestDto,
  ReferralCaptureResponseDto,
} from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { getPendingReferral, normalizeReferralCode, setPendingReferral } from '@/lib/referral';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: Partial<ReferralCaptureRequestDto>;

  try {
    payload = (await request.json()) as Partial<ReferralCaptureRequestDto>;
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
  const response = NextResponse.json<ApiResponse<ReferralCaptureResponseDto>>(
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
