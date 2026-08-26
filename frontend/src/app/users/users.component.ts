import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { UsersService, type User } from './users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  protected readonly users = signal<User[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);

  private readonly usersService = inject(UsersService);

  constructor() {
    this.loadUsers();
  }

  protected loadUsers(): void {
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

  protected fullName(user: User): string {
    const parts = [user.givenName, user.familyName].filter(Boolean);
    return parts.length ? parts.join(' ') : (user.name ?? '—');
  }

  protected referralLabel(user: User): string {
    if (!user.referredByCode) {
      return '—';
    }

    return user.referredByName
      ? `Z polecenia: ${user.referredByName}`
      : `Z polecenia: ${user.referredByCode}`;
  }
}
