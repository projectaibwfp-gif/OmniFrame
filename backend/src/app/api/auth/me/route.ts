import { NextResponse, type NextRequest } from 'next/server';
import type { ApiResponse, AuthCurrentUserResponseDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { getCurrentUserProfile, updateCurrentUserProfile } from '@/lib/profile';
import { DESCRIPTION_MAX_LENGTH, MIN_USER_AGE_YEARS, PHONE_MIN_DIGITS } from '@/lib/validation';

interface UpdateProfilePayload {
  phone?: string | null;
  birthDate?: string | null;
  description?: string | null;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  try {
    const user = await getCurrentUserProfile(auth.session.sub);
    if (user === null) {
      return errorResponse('Current user not found', 404, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json<ApiResponse<AuthCurrentUserResponseDto>>({ data: { user } });
  } catch (error) {
    logError('auth.me', ErrorCode.INTERNAL_ERROR, {}, error);
    return errorResponse('Could not load current session', 500, ErrorCode.INTERNAL_ERROR);
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (isAuthDenied(auth)) {
    return auth.response;
  }

  let payload: UpdateProfilePayload;

  try {
    payload = (await request.json()) as UpdateProfilePayload;
  } catch (error) {
    logError('auth.profile.update', ErrorCode.REQUEST_INVALID_JSON, {}, error);
    return errorResponse('Request body must be valid JSON', 400, ErrorCode.REQUEST_INVALID_JSON);
  }

  const phone = payload.phone?.trim() || null;
  const birthDate = payload.birthDate || null;
  const description = payload.description?.trim() || null;

  if (phone !== null && phone.replace(/\D/g, '').length < PHONE_MIN_DIGITS) {
    return errorResponse(
      `Phone must be valid format with at least ${PHONE_MIN_DIGITS} digits`,
      400,
      ErrorCode.VALIDATION_FAILED,
    );
  }

  if (birthDate !== null) {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      return errorResponse(
        'Birth date must be valid date format',
        400,
        ErrorCode.VALIDATION_FAILED,
      );
    }
    const today = new Date();
    if (date > today) {
      return errorResponse('Birth date cannot be in the future', 400, ErrorCode.VALIDATION_FAILED);
    }
    const latestAllowedBirthDate = new Date(
      today.getFullYear() - MIN_USER_AGE_YEARS,
      today.getMonth(),
      today.getDate(),
    );
    if (date > latestAllowedBirthDate) {
      return errorResponse(
        `User must be at least ${MIN_USER_AGE_YEARS} years old`,
        400,
        ErrorCode.VALIDATION_FAILED,
      );
    }
  }

  if (description !== null && description.length > DESCRIPTION_MAX_LENGTH) {
    return errorResponse(
      `Description must be no longer than ${DESCRIPTION_MAX_LENGTH} characters`,
      400,
      ErrorCode.VALIDATION_FAILED,
    );
  }

  try {
    await updateCurrentUserProfile({
      googleId: auth.session.sub,
      phone,
      birthDate,
      description,
    });

    const user = await getCurrentUserProfile(auth.session.sub);
    if (user === null) {
      return errorResponse('Current user not found', 404, ErrorCode.NOT_FOUND);
    }

    return NextResponse.json({ data: { user } });
  } catch (error) {
    logError('auth.profile.update', ErrorCode.DB_QUERY_FAILED, { phone }, error);
    return errorResponse('Could not update profile', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
