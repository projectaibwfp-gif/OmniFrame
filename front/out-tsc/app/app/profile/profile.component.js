import { __decorate } from "tslib";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { buildApiUrl } from '../config/api.config';
let ProfileComponent = class ProfileComponent {
    constructor() {
        this.currentUser = inject(AuthService).user;
        this.copyState = signal('idle');
        this.editMode = signal(false);
        this.isSaving = signal(false);
        this.saveError = signal(null);
        this.validationErrors = signal({});
        this.editForm = signal({
            phone: '',
            birthDate: '',
            description: '',
        });
        this.http = inject(HttpClient);
        this.authService = inject(AuthService);
        this.initials = computed(() => {
            const user = this.currentUser();
            if (!user) {
                return 'U';
            }
            const parts = user.fullName.split(/\s+/).filter(Boolean);
            return (parts
                .slice(0, 2)
                .map((value) => value.charAt(0).toUpperCase())
                .join('') || 'U');
        });
        this.referralLink = computed(() => {
            const user = this.currentUser();
            if (!user) {
                return '';
            }
            const origin = globalThis.location?.origin ?? '';
            return `${origin}/login?ref=${user.referralCode}`;
        });
    }
    toggleEditMode() {
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
    validateForm() {
        const errors = {};
        const form = this.editForm();
        if (form.phone) {
            if (!/^[\d\s+\-()]+$/.test(form.phone)) {
                errors['phone'] = 'Numer telefonu zawiera niedozwolone znaki';
            }
            else if (form.phone.replace(/\D/g, '').length < 9) {
                errors['phone'] = 'Numer telefonu musi mieć co najmniej 9 cyfr';
            }
        }
        if (form.birthDate) {
            const date = new Date(form.birthDate);
            const today = new Date();
            if (isNaN(date.getTime())) {
                errors['birthDate'] = 'Nieprawidłowa data';
            }
            else if (date > today) {
                errors['birthDate'] = 'Data nie może być w przyszłości';
            }
            else {
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
    saveProfile() {
        if (!this.validateForm()) {
            return;
        }
        this.isSaving.set(true);
        this.saveError.set(null);
        const form = this.editForm();
        this.http
            .patch(buildApiUrl('/auth/me'), {
            phone: form.phone || null,
            birthDate: form.birthDate || null,
            description: form.description || null,
        })
            .subscribe({
            next: (response) => {
                this.authService.user.set(response.data.user);
                this.editMode.set(false);
                this.isSaving.set(false);
            },
            error: (error) => {
                console.error('Failed to update profile:', error);
                this.saveError.set(error?.error?.message || 'Nie udało się zapisać zmian. Spróbuj ponownie.');
                this.isSaving.set(false);
            },
        });
    }
    cancelEdit() {
        this.editMode.set(false);
        this.validationErrors.set({});
        this.saveError.set(null);
    }
    async copyReferralLink() {
        const link = this.referralLink();
        if (!link || !navigator.clipboard) {
            this.copyState.set('error');
            return;
        }
        try {
            await navigator.clipboard.writeText(link);
            this.copyState.set('success');
        }
        catch {
            this.copyState.set('error');
        }
    }
};
ProfileComponent = __decorate([
    Component({
        selector: 'app-profile',
        standalone: true,
        imports: [CommonModule, FormsModule],
        templateUrl: './profile.component.html',
        styleUrl: './profile.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
], ProfileComponent);
export { ProfileComponent };
