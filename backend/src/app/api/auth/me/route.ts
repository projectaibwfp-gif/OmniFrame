import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, AuthCurrentUserResponseDto } from '@shared/api-contract';
import { errorResponse } from '@/lib/api-response';
import { isAuthDenied, requireAuth, loadCurrentUser } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { ErrorCode } from '@/lib/errors';
import { logError } from '@/lib/logger';

interface UpdateProfilePayload {
  phone?: string | null;
  birthDate?: string | null;
  description?: string | null;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await loadCurrentUser(request);
    if (user instanceof NextResponse) {
      return user;
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
    await getSql()`
      UPDATE users
      SET phone = ${phone},
          birth_date = ${birthDate},
          description = ${description},
          updated_at = now()
      WHERE google_id = ${auth.session.sub}
    `;

    const user = await loadCurrentUser(request);
    if (user instanceof NextResponse) {
      return user;
    }

    return NextResponse.json({ data: { user } });
  } catch (error) {
    logError('auth.profile.update', ErrorCode.DB_QUERY_FAILED, { phone }, error);
    return errorResponse('Could not update profile', 500, ErrorCode.DB_QUERY_FAILED);
  }
}
