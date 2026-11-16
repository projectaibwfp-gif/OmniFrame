import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { AuthCurrentUserResponseDto, UpdateProfileRequestDto } from '@shared/api-contract';
import { AuthService } from '../auth/auth.service';
import { ApiClient } from '../core/api/api-client';
import type { ProfileEditForm } from './profile-form';

const PROFILE_ENDPOINT = '/auth/me';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly apiClient = inject(ApiClient);
  private readonly authService = inject(AuthService);

  async updateProfile(form: ProfileEditForm): Promise<void> {
    const response = await firstValueFrom(
      this.apiClient.patch<AuthCurrentUserResponseDto>(
        PROFILE_ENDPOINT,
        toUpdateProfileRequest(form),
      ),
    );
    this.authService.setUserFromApi(response.user);
  }
}

function toUpdateProfileRequest(form: ProfileEditForm): UpdateProfileRequestDto {
  return {
    phone: form.phone || null,
    birthDate: form.birthDate || null,
    description: form.description || null,
  };
}
