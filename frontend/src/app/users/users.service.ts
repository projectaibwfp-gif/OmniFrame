import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { UsersListItemDto } from '@shared/api-contract';
import { getApiData } from '../config/api-data';

export type User = UsersListItemDto;

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return getApiData(this.http, '/users');
  }

  getUserByGoogleId(googleId: string): Observable<User> {
    return getApiData(this.http, `/users/${encodeURIComponent(googleId)}`);
  }
}
