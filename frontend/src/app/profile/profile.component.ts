import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { ApiResponse, AuthCurrentUserResponseDto } from '@shared/api-contract';
import { AuthService } from '../auth/auth.service';
import { type AuthUser } from '../auth/auth-session';
import { buildApiUrl } from '../config/api.config';

const INITIALS_MAX_CHARS = 2;
const INITIALS_FALLBACK = 'U';
const PHONE_MIN_DIGITS = 9;
const MIN_AGE_YEARS = 13;
const DESCRIPTION_MAX_LENGTH = 500;
const PHONE_ALLOWED_CHARACTERS = /^[\d\s+\-()]+$/;

interface ProfileEditForm {
  phone: string;
  birthDate: string;
  description: string;
}

@Component({
  selector: 'app-profile',
  imports: [DatePipe, FormsModule],
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

  protected readonly editForm = signal<ProfileEditForm>({
    phone: '',
    birthDate: '',
    description: '',
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
          this.authService.user.set(this.mapUser(response.data.user));
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
    const errors: Record<string, string> = {};
    const form = this.editForm();

    if (form.phone) {
      if (!PHONE_ALLOWED_CHARACTERS.test(form.phone)) {
        errors['phone'] = 'Numer telefonu zawiera niedozwolone znaki';
      } else if (form.phone.replace(/\D/g, '').length < PHONE_MIN_DIGITS) {
        errors['phone'] = `Numer telefonu musi mieć co najmniej ${PHONE_MIN_DIGITS} cyfr`;
      }
    }

    if (form.birthDate) {
      const date = new Date(form.birthDate);
      const today = new Date();
      if (Number.isNaN(date.getTime())) {
        errors['birthDate'] = 'Nieprawidłowa data';
      } else if (date > today) {
        errors['birthDate'] = 'Data nie może być w przyszłości';
      } else if (today.getFullYear() - date.getFullYear() < MIN_AGE_YEARS) {
        errors['birthDate'] = `Musisz mieć co najmniej ${MIN_AGE_YEARS} lat`;
      }
    }

    if (form.description && form.description.length > DESCRIPTION_MAX_LENGTH) {
      errors['description'] = `Opis nie może być dłuższy niż ${DESCRIPTION_MAX_LENGTH} znaków`;
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  private mapUser(user: AuthCurrentUserResponseDto['user']): AuthUser {
    return {
      givenName: user.givenName?.trim() || '',
      familyName: user.familyName?.trim() || '',
      fullName: this.buildFullName(user),
      email: user.email,
      picture: user.picture,
      role: user.role,
      phone: user.phone,
      birthDate: user.birthDate,
      description: user.description,
      referralCode: user.referralCode,
      referredByCode: user.referredByCode,
      registeredAt: user.registeredAt || '',
      lastLoginAt: user.lastLoginAt || '',
      updatedAt: user.updatedAt || '',
    };
  }

  private buildFullName(user: AuthCurrentUserResponseDto['user']): string {
    const fullNameFromClaim = user.name?.trim() || '';
    if (fullNameFromClaim) {
      return fullNameFromClaim;
    }

    const fallbackName = `${user.givenName ?? ''} ${user.familyName ?? ''}`.trim();
    return fallbackName || 'Użytkownik Google';
  }
}
