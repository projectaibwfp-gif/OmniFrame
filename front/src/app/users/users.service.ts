import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { buildApiUrl } from '../config/api.config';

export interface User {
  id: number;
  google_id: string;
  email: string;
  email_verified: boolean;
  role: 'admin' | 'user' | 'moderator';
  name: string | null;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
  registeredAt: string;
  lastLoginAt: string;
}

interface UsersResponse {
  data: User[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http
      .get<UsersResponse>(buildApiUrl('/users'))
      .pipe(map((response) => response.data));
  }
}
