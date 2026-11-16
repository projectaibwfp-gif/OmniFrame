import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { DashboardDto } from '@shared/api-contract';
import { ApiClient } from '../core/api/api-client';

export type DashboardOverview = DashboardDto['overview'];
export type DashboardActivityPoint = DashboardDto['activity'][number];
export type DashboardRecentUser = DashboardDto['recentUsers'][number];
export type DashboardTopReferrer = DashboardDto['topReferrers'][number];
export type DashboardData = DashboardDto;

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiClient = inject(ApiClient);

  getDashboard(): Observable<DashboardData> {
    return this.apiClient.get('/dashboard');
  }
}
