import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { UsersListItemDto } from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

export type User = UsersListItemDto;

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly apiClient = inject(ApiClient);

  getUsers(): Observable<User[]> {
    return this.apiClient.get('/users');
  }

  getUserByGoogleId(googleId: string): Observable<User> {
    return this.apiClient.get(`/users/${encodeURIComponent(googleId)}`);
  }
}
