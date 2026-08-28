import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AppDateTimePipe } from '../core/date-time.pipe';
import {
  DashboardService,
  type DashboardActivityPoint,
  type DashboardData,
} from './dashboard.service';
import { buildAreaPath, buildLinePath, buildYAxisTicks, toBarHeights } from './dashboard-chart';

interface DashboardStatCard {
  label: string;
  value: string;
  note: string;
  icon: string;
  iconClass: string;
  barClass: string;
  bars: number[];
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, AppDateTimePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  protected readonly dashboard = signal<DashboardData | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);
  protected readonly currentUser = inject(AuthService).user;
  protected readonly todayLabel = this.formatTodayLabel();
  protected readonly activity = computed(() => this.dashboard()?.activity ?? []);
  protected readonly chartMax = computed(() => {
    const points = this.activity();
    const values = points.flatMap((point) => [point.logins, point.signups]);
    return Math.max(1, ...values);
  });
  protected readonly chartYAxis = computed(() => buildYAxisTicks(this.chartMax()));
  protected readonly loginsLinePath = computed(() =>
    buildLinePath(
      this.activity().map((point) => point.logins),
      this.chartMax(),
    ),
  );
  protected readonly loginsAreaPath = computed(() =>
    buildAreaPath(
      this.activity().map((point) => point.logins),
      this.chartMax(),
    ),
  );
  protected readonly signupsLinePath = computed(() =>
    buildLinePath(
      this.activity().map((point) => point.signups),
      this.chartMax(),
    ),
  );
  protected readonly statCards = computed<DashboardStatCard[]>(() => {
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
        bars: toBarHeights(activity.map((point) => point.signups)),
      },
      {
        label: 'Logowania dzisiaj',
        value: this.formatNumber(dashboard.overview.loginsToday),
        note: this.formatDailyChange(
          today?.logins ?? 0,
          yesterday?.logins ?? 0,
          'wzgledem wczoraj',
        ),
        icon: '◉',
        iconClass: 'green',
        barClass: 'green-bars',
        bars: toBarHeights(activity.map((point) => point.logins)),
      },
      {
        label: 'Nowi dzisiaj',
        value: this.formatNumber(dashboard.overview.newUsersToday),
        note: this.formatDailyChange(
          today?.signups ?? 0,
          yesterday?.signups ?? 0,
          'rejestracji vs wczoraj',
        ),
        icon: '+',
        iconClass: 'orange',
        barClass: 'orange-bars',
        bars: toBarHeights(activity.map((point) => point.signups)),
      },
      {
        label: 'Konta z polecenia',
        value: this.formatNumber(dashboard.overview.referredUsers),
        note: `${dashboard.overview.referralShare}% wszystkich rejestracji`,
        icon: '↗',
        iconClass: 'blue',
        barClass: 'blue-bars',
        bars: toBarHeights(activity.map((point) => point.referredSignups)),
      },
    ];
  });
  protected readonly topReferrer = computed(() => this.dashboard()?.topReferrers[0] ?? null);
  protected readonly latestActiveUser = computed(() => this.dashboard()?.recentUsers[0] ?? null);
  protected readonly usersWithoutReferral = computed(() => {
    const dashboard = this.dashboard();
    if (!dashboard) {
      return 0;
    }

    return dashboard.overview.totalUsers - dashboard.overview.referredUsers;
  });

  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.isLoading.set(true);
    this.apiError.set(false);
    this.dashboardService
      .getDashboard()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (dashboard) => this.dashboard.set(dashboard),
        error: () => this.apiError.set(true),
      });
  }

  protected activitySummary(point: DashboardActivityPoint): string {
    return `${point.logins} logowan / ${point.signups} rejestracji`;
  }

  private formatTodayLabel(): string {
    const formatted = new Intl.DateTimeFormat('pl-PL', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pl-PL').format(value);
  }

  private formatDailyChange(current: number, previous: number, suffix: string): string {
    const delta = current - previous;
    if (delta === 0) {
      return `Bez zmian ${suffix}`;
    }

    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta} ${suffix}`;
  }
}
