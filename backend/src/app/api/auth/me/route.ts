import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, AuthCurrentUserResponseDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth } from '@/lib/auth';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { getCurrentUserProfile, updateCurrentUserProfile } from '@/lib/profile';

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

  if (phone !== null && !/^[\d\s+\-()]{9,}$/.test(phone)) {
    return errorResponse(
      'Phone must be valid format with at least 9 digits',
      400,
      ErrorCode.VALIDATION_FAILED,
    );
  }

  if (birthDate !== null) {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      return errorResponse('Birth date must be valid date format', 400, ErrorCode.VALIDATION_FAILED);
    }
    const today = new Date();
    if (date > today) {
      return errorResponse('Birth date cannot be in the future', 400, ErrorCode.VALIDATION_FAILED);
    }
    const age = today.getFullYear() - date.getFullYear();
    if (age < 13) {
      return errorResponse('User must be at least 13 years old', 400, ErrorCode.VALIDATION_FAILED);
    }
  }

  if (description !== null && description.length > 500) {
    return errorResponse(
      'Description must be no longer than 500 characters',
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
