import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { buildApiUrl } from '../config/api.config';

export interface DashboardOverview {
  totalUsers: number;
  verifiedUsers: number;
  loginsToday: number;
  newUsersToday: number;
  referredUsers: number;
  referralShare: number;
  verifiedShare: number;
}

export interface DashboardActivityPoint {
  label: string;
  signups: number;
  logins: number;
  referredSignups: number;
}

export interface DashboardRecentUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  lastLoginAt: string;
  registeredAt: string;
  referredByCode: string | null;
}

export interface DashboardTopReferrer {
  id: number;
  name: string;
  email: string;
  referralCode: string;
  referrals: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  activity: DashboardActivityPoint[];
  recentUsers: DashboardRecentUser[];
  topReferrers: DashboardTopReferrer[];
}

interface DashboardResponse {
  data: DashboardData;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<DashboardData> {
    return this.http
      .get<DashboardResponse>(buildApiUrl('/dashboard'))
      .pipe(map((response) => response.data));
  }
}
