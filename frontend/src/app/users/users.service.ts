import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { UsersListItemDto, UsersListResponseDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

export type User = UsersListItemDto;
type UsersResponse = UsersListResponseDto;

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http
      .get<UsersResponse>(buildApiUrl('/users'))
      .pipe(map((response) => response.data));
  }

  getUserByGoogleId(googleId: string): Observable<User> {
    return this.http
      .get<{ data: User }>(buildApiUrl(`/users/${encodeURIComponent(googleId)}`))
      .pipe(map((response) => response.data));
  }
}
