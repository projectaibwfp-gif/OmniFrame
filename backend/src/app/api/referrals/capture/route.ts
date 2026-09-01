import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, ReferralCaptureResponseDto } from '@shared/api-contract';
import { ReferralCaptureRequestSchema } from '@shared/api-schemas';
import { errorResponse } from '@/lib/api-response';
import { parseJsonBody } from '@/lib/request-validation';
import { getPendingReferral, setPendingReferral } from '@/lib/referral';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const validation = await parseJsonBody(request, ReferralCaptureRequestSchema, {
    scope: 'referrals.capture',
  });
  if (!validation.ok) {
    return validation.response;
  }

  const { referralCode } = validation.data;

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
