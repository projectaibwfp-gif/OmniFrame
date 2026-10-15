import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { DashboardDto } from '@shared/api-contract';
import { getApiData } from '../config/api-data';

export type DashboardOverview = DashboardDto['overview'];
export type DashboardActivityPoint = DashboardDto['activity'][number];
export type DashboardRecentUser = DashboardDto['recentUsers'][number];
export type DashboardTopReferrer = DashboardDto['topReferrers'][number];
export type DashboardData = DashboardDto;

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<DashboardData> {
    return getApiData(this.http, '/dashboard');
  }
}
