import { __decorate } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { buildApiUrl } from '../config/api.config';
let DashboardService = class DashboardService {
    constructor() {
        this.http = inject(HttpClient);
    }
    getDashboard() {
        return this.http
            .get(buildApiUrl('/dashboard'))
            .pipe(map((response) => response.data));
    }
};
DashboardService = __decorate([
    Injectable({ providedIn: 'root' })
], DashboardService);
export { DashboardService };
