import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import type { ApiResponse, AuthCurrentUserResponseDto } from '@shared/api-contract';
import { AuthService } from '../auth/auth.service';
import { mapAuthUser } from '../auth/auth-user.mapper';
import { buildApiUrl } from '../config/api.config';
import { AppDatePipe } from '../core/date-time.pipe';
import { MainCharacterService } from '../services/main-character.service';
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

  protected readonly mainCharacter = computed(() => this.mainCharacterService.character());
  protected readonly mainCharacterBadge = computed(() => this.mainCharacterService.badge());

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
  private readonly mainCharacterService = inject(MainCharacterService);
  private readonly destroyRef = inject(DestroyRef);

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
      .pipe(takeUntilDestroyed(this.destroyRef))
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

    this.mainCharacterService
      .link(name)
      .then(() => {
        this.mainCharacterName.set('');
      })
      .catch((error: unknown) => {
        console.error('Failed to link main character:', error);
        const message =
          typeof error === 'object' && error !== null && 'error' in error
            ? (error as { error?: { message?: string } }).error?.message
            : undefined;
        this.mainCharacterError.set(message || MAIN_CHARACTER_LINK_ERROR);
      })
      .finally(() => {
        this.isMainCharacterSaving.set(false);
      });
  }

  protected unlinkMainCharacter(): void {
    this.isMainCharacterSaving.set(true);
    this.mainCharacterError.set(null);

    this.mainCharacterService
      .unlink()
      .catch((error: unknown) => {
        console.error('Failed to unlink main character:', error);
        const message =
          typeof error === 'object' && error !== null && 'error' in error
            ? (error as { error?: { message?: string } }).error?.message
            : undefined;
        this.mainCharacterError.set(message || MAIN_CHARACTER_UNLINK_ERROR);
      })
      .finally(() => {
        this.isMainCharacterSaving.set(false);
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
