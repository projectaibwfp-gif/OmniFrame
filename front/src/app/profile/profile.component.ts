import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { ApiResponse, AuthCurrentUserResponseDto } from '@shared/api-contract';
import { AuthService } from '../auth/auth.service';
import { type AuthUser } from '../auth/auth-session';
import { buildApiUrl } from '../config/api.config';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly currentUser = inject(AuthService).user;
  readonly copyState = signal<'idle' | 'success' | 'error'>('idle');
  readonly editMode = signal(false);
  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly validationErrors = signal<Record<string, string>>({});

  readonly editForm = signal({
    phone: '',
    birthDate: '',
    description: '',
  });

  readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return 'U';
    }
    const parts = user.fullName.split(/\s+/).filter(Boolean);
    return (
      parts
        .slice(0, 2)
        .map((value) => value.charAt(0).toUpperCase())
        .join('') || 'U'
    );
  });

  readonly referralLink = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return '';
    }

    const origin = globalThis.location?.origin ?? '';
    return `${origin}/login?ref=${user.referralCode}`;
  });

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  toggleEditMode(): void {
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
    this.editMode.update((v) => !v);
  }

  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const form = this.editForm();

    if (form.phone) {
      if (!/^[\d\s+\-()]+$/.test(form.phone)) {
        errors['phone'] = 'Numer telefonu zawiera niedozwolone znaki';
      } else if (form.phone.replace(/\D/g, '').length < 9) {
        errors['phone'] = 'Numer telefonu musi mieć co najmniej 9 cyfr';
      }
    }

    if (form.birthDate) {
      const date = new Date(form.birthDate);
      const today = new Date();
      if (isNaN(date.getTime())) {
        errors['birthDate'] = 'Nieprawidłowa data';
      } else if (date > today) {
        errors['birthDate'] = 'Data nie może być w przyszłości';
      } else {
        const age = today.getFullYear() - date.getFullYear();
        if (age < 13) {
          errors['birthDate'] = 'Musisz mieć co najmniej 13 lat';
        }
      }
    }

    if (form.description && form.description.length > 500) {
      errors['description'] = 'Opis nie może być dłuższy niż 500 znaków';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  saveProfile(): void {
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

  cancelEdit(): void {
    this.editMode.set(false);
    this.validationErrors.set({});
    this.saveError.set(null);
  }

  async copyReferralLink(): Promise<void> {
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

  private mapUser(user: AuthCurrentUserResponseDto['user']): AuthUser {
    return {
      givenName: user.given_name?.trim() || '',
      familyName: user.family_name?.trim() || '',
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

    const fallbackName = `${user.given_name ?? ''} ${user.family_name ?? ''}`.trim();
    return fallbackName || 'Użytkownik Google';
  }
}
