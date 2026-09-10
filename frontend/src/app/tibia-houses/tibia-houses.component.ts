import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type { TibiaHouseOverviewDto, TibiaHousesOverviewDto } from '@shared/api-contract';
import { LocalizationService } from '../services/localization.service';
import { TibiaWorldsService } from '../tibia-worlds/tibia-worlds.service';
import { TibiaHousesService } from './tibia-houses.service';
import { buildHousesLabels } from './tibia-houses.labels';

interface HouseListSection {
  title: string;
  houses: TibiaHouseOverviewDto[];
}

@Component({
  selector: 'app-tibia-houses',
  imports: [FormsModule, RouterLink],
  templateUrl: './tibia-houses.component.html',
  styleUrl: './tibia-houses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaHousesComponent {
  protected readonly worlds = signal<string[]>([]);
  protected readonly selectedWorld = signal('');
  protected readonly town = signal('');
  protected readonly data = signal<TibiaHousesOverviewDto | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly apiError = signal(false);
  protected readonly isLoadingWorlds = signal(true);
  protected readonly worldsError = signal(false);

  protected readonly labels = computed(() =>
    buildHousesLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly sections = computed<HouseListSection[]>(() => [
    { title: this.labels().housesTitle, houses: this.data()?.houseList ?? [] },
    { title: this.labels().guildhallsTitle, houses: this.data()?.guildhallList ?? [] },
  ]);
  protected readonly hasResults = computed(() =>
    this.sections().some((section) => section.houses.length > 0),
  );
  protected readonly canSearch = computed(
    () => this.selectedWorld().trim().length > 0 && this.town().trim().length > 0,
  );
  protected readonly resultTown = computed(() => this.data()?.town ?? '');
  protected readonly resultWorld = computed(() => this.data()?.world ?? '');

  private readonly tibiaHousesService = inject(TibiaHousesService);
  private readonly tibiaWorldsService = inject(TibiaWorldsService);
  private readonly localization = inject(LocalizationService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadWorlds();
  }

  protected setSelectedWorld(value: string): void {
    this.selectedWorld.set(value);
    this.data.set(null);
  }

  protected setTown(value: string): void {
    this.town.set(value);
    this.data.set(null);
  }

  protected search(): void {
    const world = this.selectedWorld().trim();
    const town = this.town().trim();
    if (!world || !town) {
      return;
    }

    this.loadHouses(world, town);
  }

  protected loadHouses(world: string, town: string): void {
    this.isLoading.set(true);
    this.apiError.set(false);

    this.tibiaHousesService
      .getHouses(world, town)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.data.set(response),
        error: () => this.apiError.set(true),
      });
  }

  protected houseStatus(house: TibiaHouseOverviewDto): 'rented' | 'auctioned' | 'free' {
    if (house.rented) {
      return 'rented';
    }
    if (house.auctioned) {
      return 'auctioned';
    }
    return 'free';
  }

  private loadWorlds(): void {
    this.tibiaWorldsService
      .getWorlds()
      .pipe(
        finalize(() => this.isLoadingWorlds.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.worlds.set(response.regularWorlds.map((world) => world.name)),
        error: () => this.worldsError.set(true),
      });
  }
}
