import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  ApiResponse,
  AuthCurrentUserResponseDto,
  UpdateProfileRequestDto,
} from '@shared/api-contract';
import { AuthService } from '../auth/auth.service';
import { buildApiUrl } from '../config/api.config';
import type { ProfileEditForm } from './profile-form';

const PROFILE_ENDPOINT = '/auth/me';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  async updateProfile(form: ProfileEditForm): Promise<void> {
    const response = await firstValueFrom(
      this.http.patch<ApiResponse<AuthCurrentUserResponseDto>>(
        buildApiUrl(PROFILE_ENDPOINT),
        toUpdateProfileRequest(form),
      ),
    );
    this.authService.setUserFromApi(response.data.user);
  }
}

function toUpdateProfileRequest(form: ProfileEditForm): UpdateProfileRequestDto {
  return {
    phone: form.phone || null,
    birthDate: form.birthDate || null,
    description: form.description || null,
  };
}
