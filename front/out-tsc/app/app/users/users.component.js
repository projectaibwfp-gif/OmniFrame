import { __decorate, __metadata } from "tslib";
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { UsersService } from './users.service';
let UsersComponent = class UsersComponent {
    constructor() {
        this.users = signal([]);
        this.isLoading = signal(true);
        this.apiError = signal(false);
        this.usersService = inject(UsersService);
        this.loadUsers();
    }
    loadUsers() {
        this.isLoading.set(true);
        this.apiError.set(false);
        this.usersService
            .getUsers()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: (users) => this.users.set(users),
            error: () => this.apiError.set(true),
        });
    }
    fullName(user) {
        const parts = [user.given_name, user.family_name].filter(Boolean);
        return parts.length ? parts.join(' ') : (user.name ?? '—');
    }
};
UsersComponent = __decorate([
    Component({
        selector: 'app-users',
        standalone: true,
        templateUrl: './users.component.html',
        styleUrl: './users.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    }),
    __metadata("design:paramtypes", [])
], UsersComponent);
export { UsersComponent };
