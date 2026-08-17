import { __decorate, __metadata } from "tslib";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { DashboardService, } from './dashboard.service';
const CHART_WIDTH = 700;
const CHART_HEIGHT = 185;
let DashboardComponent = class DashboardComponent {
    constructor() {
        this.dashboard = signal(null);
        this.isLoading = signal(true);
        this.apiError = signal(false);
        this.currentUser = inject(AuthService).user;
        this.todayLabel = this.formatTodayLabel();
        this.activity = computed(() => this.dashboard()?.activity ?? []);
        this.chartMax = computed(() => {
            const points = this.activity();
            const values = points.flatMap((point) => [point.logins, point.signups]);
            return Math.max(1, ...values);
        });
        this.chartYAxis = computed(() => {
            const max = this.chartMax();
            return [max, Math.ceil((max * 2) / 3), Math.ceil(max / 3), 0];
        });
        this.loginsLinePath = computed(() => this.buildLinePath(this.activity().map((point) => point.logins), this.chartMax()));
        this.loginsAreaPath = computed(() => this.buildAreaPath(this.activity().map((point) => point.logins), this.chartMax()));
        this.signupsLinePath = computed(() => this.buildLinePath(this.activity().map((point) => point.signups), this.chartMax()));
        this.statCards = computed(() => {
            const dashboard = this.dashboard();
            if (!dashboard) {
                return [];
            }
            const activity = dashboard.activity;
            const today = activity[activity.length - 1];
            const yesterday = activity[activity.length - 2];
            return [
                {
                    label: 'Konta Google',
                    value: this.formatNumber(dashboard.overview.totalUsers),
                    note: `${dashboard.overview.verifiedUsers} zweryfikowanych adresow (${dashboard.overview.verifiedShare}%)`,
                    icon: 'G',
                    iconClass: 'purple',
                    barClass: 'purple-bars',
                    bars: this.toBarHeights(activity.map((point) => point.signups)),
                },
                {
                    label: 'Logowania dzisiaj',
                    value: this.formatNumber(dashboard.overview.loginsToday),
                    note: this.formatDailyChange(today?.logins ?? 0, yesterday?.logins ?? 0, 'wzgledem wczoraj'),
                    icon: '◉',
                    iconClass: 'green',
                    barClass: 'green-bars',
                    bars: this.toBarHeights(activity.map((point) => point.logins)),
                },
                {
                    label: 'Nowi dzisiaj',
                    value: this.formatNumber(dashboard.overview.newUsersToday),
                    note: this.formatDailyChange(today?.signups ?? 0, yesterday?.signups ?? 0, 'rejestracji vs wczoraj'),
                    icon: '+',
                    iconClass: 'orange',
                    barClass: 'orange-bars',
                    bars: this.toBarHeights(activity.map((point) => point.signups)),
                },
                {
                    label: 'Konta z polecenia',
                    value: this.formatNumber(dashboard.overview.referredUsers),
                    note: `${dashboard.overview.referralShare}% wszystkich rejestracji`,
                    icon: '↗',
                    iconClass: 'blue',
                    barClass: 'blue-bars',
                    bars: this.toBarHeights(activity.map((point) => point.referredSignups)),
                },
            ];
        });
        this.topReferrer = computed(() => this.dashboard()?.topReferrers[0] ?? null);
        this.latestActiveUser = computed(() => this.dashboard()?.recentUsers[0] ?? null);
        this.usersWithoutReferral = computed(() => {
            const dashboard = this.dashboard();
            if (!dashboard) {
                return 0;
            }
            return dashboard.overview.totalUsers - dashboard.overview.referredUsers;
        });
        this.dashboardService = inject(DashboardService);
        this.loadDashboard();
    }
    loadDashboard() {
        this.isLoading.set(true);
        this.apiError.set(false);
        this.dashboardService
            .getDashboard()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
            next: (dashboard) => this.dashboard.set(dashboard),
            error: () => this.apiError.set(true),
        });
    }
    activitySummary(point) {
        return `${point.logins} logowan / ${point.signups} rejestracji`;
    }
    formatTodayLabel() {
        const formatted = new Intl.DateTimeFormat('pl-PL', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(new Date());
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    formatNumber(value) {
        return new Intl.NumberFormat('pl-PL').format(value);
    }
    formatDailyChange(current, previous, suffix) {
        const delta = current - previous;
        if (delta === 0) {
            return `Bez zmian ${suffix}`;
        }
        const sign = delta > 0 ? '+' : '';
        return `${sign}${delta} ${suffix}`;
    }
    toBarHeights(values) {
        const max = Math.max(1, ...values);
        return values.map((value) => Math.max(18, Math.round((value / max) * 100)));
    }
    buildLinePath(values, max) {
        if (values.length === 0) {
            return '';
        }
        return values
            .map((value, index) => {
            const x = values.length === 1 ? CHART_WIDTH / 2 : (index / (values.length - 1)) * CHART_WIDTH;
            const y = CHART_HEIGHT - (value / max) * (CHART_HEIGHT - 24);
            return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
        })
            .join(' ');
    }
    buildAreaPath(values, max) {
        if (values.length === 0) {
            return '';
        }
        const line = this.buildLinePath(values, max);
        return `${line} L ${CHART_WIDTH},${CHART_HEIGHT} L 0,${CHART_HEIGHT} Z`;
    }
};
DashboardComponent = __decorate([
    Component({
        selector: 'app-dashboard',
        standalone: true,
        imports: [RouterLink],
        templateUrl: './dashboard.component.html',
        styleUrl: './dashboard.component.scss',
        changeDetection: ChangeDetectionStrategy.OnPush,
    }),
    __metadata("design:paramtypes", [])
], DashboardComponent);
export { DashboardComponent };
