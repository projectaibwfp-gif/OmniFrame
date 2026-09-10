import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type { TibiaHouseDto } from '@shared/api-contract';
import { AppDateTimePipe } from '../core/date-time.pipe';
import { LocalizationService } from '../services/localization.service';
import { TibiaHousesService } from './tibia-houses.service';
import { buildHouseDetailLabels } from './tibia-house-detail.labels';

@Component({
  selector: 'app-tibia-house-detail',
  imports: [RouterLink, AppDateTimePipe],
  templateUrl: './tibia-house-detail.component.html',
  styleUrl: './tibia-house-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaHouseDetailComponent {
  readonly world = input.required<string>();
  readonly houseId = input.required<string>();
  protected readonly house = signal<TibiaHouseDto | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);

  protected readonly labels = computed(() =>
    buildHouseDetailLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly worldName = computed(() => this.house()?.world ?? this.world());

  private readonly tibiaHousesService = inject(TibiaHousesService);
  private readonly localization = inject(LocalizationService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => this.loadHouse());
  }

  protected loadHouse(): void {
    const houseId = Number(this.houseId());
    if (!Number.isFinite(houseId) || houseId < 1) {
      this.apiError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.apiError.set(false);

    this.tibiaHousesService
      .getHouse(this.world(), houseId)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.house.set(response),
        error: () => this.apiError.set(true),
      });
  }
}
