import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import type { ApiResponse, AuthCurrentUserResponseDto } from '@shared/api-contract';
import { AuthService } from '../auth/auth.service';
import { mapAuthUser } from '../auth/auth-user.mapper';
import { buildApiUrl } from '../config/api.config';
import { AppDatePipe } from '../core/date-time.pipe';
import { formatMainCharacterBadge } from '../core/vocation';
import { EMPTY_PROFILE_FORM, type ProfileEditForm, validateProfileForm } from './profile-form';

const INITIALS_MAX_CHARS = 2;
const INITIALS_FALLBACK = 'U';
const MAIN_CHARACTER_LINK_ERROR =
  'Nie udało się powiązać postaci. Sprawdź nazwę i spróbuj ponownie.';
const MAIN_CHARACTER_UNLINK_ERROR = 'Nie udało się odpiąć postaci. Spróbuj ponownie.';

@Component({
  selector: 'app-profile',
  imports: [AppDatePipe, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  protected readonly currentUser = inject(AuthService).user;
  protected readonly copyState = signal<'idle' | 'success' | 'error'>('idle');
  protected readonly editMode = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly validationErrors = signal<Record<string, string>>({});

  protected readonly editForm = signal<ProfileEditForm>({ ...EMPTY_PROFILE_FORM });

  protected readonly mainCharacterName = signal('');
  protected readonly isMainCharacterSaving = signal(false);
  protected readonly mainCharacterError = signal<string | null>(null);

  protected readonly mainCharacter = computed(() => this.currentUser()?.mainCharacter ?? null);
  protected readonly mainCharacterBadge = computed(() => {
    const character = this.mainCharacter();
    if (!character) {
      return '';
    }
    return formatMainCharacterBadge(character.vocation, character.level);
  });

  protected readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return INITIALS_FALLBACK;
    }
    const parts = user.fullName.split(/\s+/).filter(Boolean);
    return (
      parts
        .slice(0, INITIALS_MAX_CHARS)
        .map((value) => value.charAt(0).toUpperCase())
        .join('') || INITIALS_FALLBACK
    );
  });

  protected readonly referralLink = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return '';
    }

    const origin = globalThis.location?.origin ?? '';
    return `${origin}/login?ref=${user.referralCode}`;
  });

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  protected toggleEditMode(): void {
    if (!this.editMode()) {
      const user = this.currentUser();
      if (user) {
        this.editForm.set({
          phone: user.phone || '',
          birthDate: user.birthDate || '',
          description: user.description || '',
        });
      }
      this.validationErrors.set({});
      this.saveError.set(null);
    }
    this.editMode.update((value) => !value);
  }

  protected saveProfile(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);
    const form = this.editForm();

    this.http
      .patch<ApiResponse<AuthCurrentUserResponseDto>>(buildApiUrl('/auth/me'), {
        phone: form.phone || null,
        birthDate: form.birthDate || null,
        description: form.description || null,
      })
      .subscribe({
        next: (response) => {
          this.authService.user.set(mapAuthUser(response.data.user));
          this.editMode.set(false);
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.saveError.set(
            error?.error?.message || 'Nie udało się zapisać zmian. Spróbuj ponownie.',
          );
          this.isSaving.set(false);
        },
      });
  }

  protected cancelEdit(): void {
    this.editMode.set(false);
    this.validationErrors.set({});
    this.saveError.set(null);
  }

  protected linkMainCharacter(): void {
    const name = this.mainCharacterName().trim();
    if (!name) {
      this.mainCharacterError.set('Podaj nazwę postaci.');
      return;
    }

    this.isMainCharacterSaving.set(true);
    this.mainCharacterError.set(null);

    this.http
      .put<ApiResponse<AuthCurrentUserResponseDto>>(buildApiUrl('/auth/me/main-character'), {
        name,
      })
      .subscribe({
        next: (response) => {
          this.authService.user.set(mapAuthUser(response.data.user));
          this.mainCharacterName.set('');
          this.isMainCharacterSaving.set(false);
        },
        error: (error) => {
          console.error('Failed to link main character:', error);
          this.mainCharacterError.set(error?.error?.message || MAIN_CHARACTER_LINK_ERROR);
          this.isMainCharacterSaving.set(false);
        },
      });
  }

  protected unlinkMainCharacter(): void {
    this.isMainCharacterSaving.set(true);
    this.mainCharacterError.set(null);

    this.http
      .delete<ApiResponse<AuthCurrentUserResponseDto>>(buildApiUrl('/auth/me/main-character'))
      .subscribe({
        next: (response) => {
          this.authService.user.set(mapAuthUser(response.data.user));
          this.isMainCharacterSaving.set(false);
        },
        error: (error) => {
          console.error('Failed to unlink main character:', error);
          this.mainCharacterError.set(error?.error?.message || MAIN_CHARACTER_UNLINK_ERROR);
          this.isMainCharacterSaving.set(false);
        },
      });
  }

  protected async copyReferralLink(): Promise<void> {
    const link = this.referralLink();
    if (!link || !navigator.clipboard) {
      this.copyState.set('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      this.copyState.set('success');
    } catch {
      this.copyState.set('error');
    }
  }

  private validateForm(): boolean {
    const errors = validateProfileForm(this.editForm());
    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }
}
