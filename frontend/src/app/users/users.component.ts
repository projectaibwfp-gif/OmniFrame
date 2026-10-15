import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppDateTimePipe } from '../core/date-time.pipe';
import { resourceErrorMessage, resourceValueOr } from '../core/resource-value';
import { UsersService, type User } from './users.service';

const EMPTY_USERS_MESSAGE = 'Brak użytkowników do wyświetlenia.';
const NAME_FALLBACK = '—';
const NO_USERS: User[] = [];

@Component({
  selector: 'app-users',
  imports: [AppDateTimePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  protected readonly usersResource = rxResource({
    stream: () => this.usersService.getUsers(),
  });
  protected readonly users = resourceValueOr(this.usersResource, NO_USERS);
  protected readonly errorMessage = resourceErrorMessage(this.usersResource);
  protected readonly isEmpty = computed(
    () => this.usersResource.hasValue() && this.users().length === 0,
  );
  protected readonly emptyMessage = EMPTY_USERS_MESSAGE;

  private readonly usersService = inject(UsersService);

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
