import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import type { ApiResponse, DashboardDto } from '@shared/api-contract';
import { buildApiUrl } from '../config/api.config';

export type DashboardOverview = DashboardDto['overview'];
export type DashboardActivityPoint = DashboardDto['activity'][number];
export type DashboardRecentUser = DashboardDto['recentUsers'][number];
export type DashboardTopReferrer = DashboardDto['topReferrers'][number];
export type DashboardData = DashboardDto;
type DashboardResponse = ApiResponse<DashboardDto>;

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<DashboardData> {
    return this.http
      .get<DashboardResponse>(buildApiUrl('/dashboard'))
      .pipe(map((response) => response.data));
  }
}
