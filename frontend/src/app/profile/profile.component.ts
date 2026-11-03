import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AppDatePipe } from '../core/date-time.pipe';
import { extractApiErrorMessage } from '../core/http-error';
import { MainCharacterService } from '../services/main-character.service';
import { EMPTY_PROFILE_FORM, type ProfileEditForm, validateProfileForm } from './profile-form';
import { APP_DISPLAY_NAME } from '@shared/runtime-config';
import { getHuntingRecommendations } from './hunting-recommendations';
import { ProfileService } from './profile.service';

const INITIALS_MAX_CHARS = 2;
const INITIALS_FALLBACK = 'U';
const PROFILE_SAVE_ERROR = 'Nie udało się zapisać zmian. Spróbuj ponownie.';
const MAIN_CHARACTER_NAME_REQUIRED = 'Podaj nazwę postaci.';
const MAIN_CHARACTER_LINK_ERROR =
  'Nie udało się powiązać postaci. Sprawdź nazwę i spróbuj ponownie.';
const MAIN_CHARACTER_UNLINK_ERROR = 'Nie udało się odpiąć postaci. Spróbuj ponownie.';

@Component({
  selector: 'app-profile',
  imports: [AppDatePipe, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  protected readonly appDisplayName = APP_DISPLAY_NAME;
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
  protected readonly huntingRecommendations = computed(() => {
    const character = this.mainCharacter();
    return getHuntingRecommendations(character?.level, character?.vocation);
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

  private readonly profileService = inject(ProfileService);
  private readonly mainCharacterService = inject(MainCharacterService);

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

  protected async saveProfile(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    try {
      await this.profileService.updateProfile(this.editForm());
      this.editMode.set(false);
    } catch (error) {
      this.saveError.set(extractApiErrorMessage(error, PROFILE_SAVE_ERROR));
    } finally {
      this.isSaving.set(false);
    }
  }

  protected cancelEdit(): void {
    this.editMode.set(false);
    this.validationErrors.set({});
    this.saveError.set(null);
  }

  protected async linkMainCharacter(): Promise<void> {
    const name = this.mainCharacterName().trim();
    if (!name) {
      this.mainCharacterError.set(MAIN_CHARACTER_NAME_REQUIRED);
      return;
    }

    this.isMainCharacterSaving.set(true);
    this.mainCharacterError.set(null);

    try {
      await this.mainCharacterService.link(name);
      this.mainCharacterName.set('');
    } catch (error) {
      this.mainCharacterError.set(extractApiErrorMessage(error, MAIN_CHARACTER_LINK_ERROR));
    } finally {
      this.isMainCharacterSaving.set(false);
    }
  }

  protected async unlinkMainCharacter(): Promise<void> {
    this.isMainCharacterSaving.set(true);
    this.mainCharacterError.set(null);

    try {
      await this.mainCharacterService.unlink();
    } catch (error) {
      this.mainCharacterError.set(extractApiErrorMessage(error, MAIN_CHARACTER_UNLINK_ERROR));
    } finally {
      this.isMainCharacterSaving.set(false);
    }
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
