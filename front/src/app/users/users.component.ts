import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { UsersService, type User } from './users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  readonly users = signal<User[]>([]);
  readonly isLoading = signal(true);
  readonly apiError = signal(false);

  private readonly usersService = inject(UsersService);

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
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

  fullName(user: User): string {
    const parts = [user.given_name, user.family_name].filter(Boolean);
    return parts.length ? parts.join(' ') : (user.name ?? '—');
  }

  referralLabel(user: User): string {
    if (!user.referredByCode) {
      return '—';
    }

    return user.referredByName ? `Z polecenia: ${user.referredByName}` : `Z polecenia: ${user.referredByCode}`;
  }
}
