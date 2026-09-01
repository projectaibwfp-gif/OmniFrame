import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppDateTimePipe } from '../core/date-time.pipe';
import { createRequestState } from '../core/request-state';
import { UsersService, type User } from './users.service';

const EMPTY_USERS_MESSAGE = 'Brak użytkowników do wyświetlenia.';
const NAME_FALLBACK = '—';

@Component({
  selector: 'app-users',
  imports: [AppDateTimePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  protected readonly state = createRequestState<User[]>({
    isEmpty: (users) => users.length === 0,
  });
  protected readonly users = computed<User[]>(() => this.state.data() ?? []);
  protected readonly emptyMessage = EMPTY_USERS_MESSAGE;

  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadUsers();
  }

  protected loadUsers(): void {
    this.state.run(this.usersService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)));
  }

  protected fullName(user: User): string {
    const parts = [user.givenName, user.familyName].filter(Boolean);
    return parts.length ? parts.join(' ') : (user.name ?? NAME_FALLBACK);
  }

  protected referralLabel(user: User): string {
    if (!user.referredByCode) {
      return NAME_FALLBACK;
    }

    return user.referredByName
      ? `Z polecenia: ${user.referredByName}`
      : `Z polecenia: ${user.referredByCode}`;
  }
}
