import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import type { TibiaHouseOverviewDto } from '@shared/api-contract';
import { resourceValueOr } from '../core/resource-value';
import { LocalizationService } from '../services/localization.service';
import { WorldOptionsService } from '../tibia-worlds/world-options.service';
import { TibiaHousesService } from './tibia-houses.service';
import { buildHousesLabels } from './tibia-houses.labels';

interface HouseListSection {
  title: string;
  houses: TibiaHouseOverviewDto[];
}

interface HousesSearch {
  world: string;
  town: string;
}

@Component({
  selector: 'app-tibia-houses',
  imports: [FormsModule, RouterLink],
  templateUrl: './tibia-houses.component.html',
  styleUrl: './tibia-houses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaHousesComponent {
  protected readonly worlds = computed(() => this.worldOptions.options());
  protected readonly isLoadingWorlds = computed(() => this.worldOptions.isLoading());
  protected readonly worldsError = computed(() => this.worldOptions.hasError());
  protected readonly selectedWorld = signal('');
  protected readonly town = signal('');
  protected readonly housesResource = rxResource({
    params: () => this.submittedSearch(),
    stream: ({ params }) => this.tibiaHousesService.getHouses(params.world, params.town),
  });
  protected readonly data = resourceValueOr(this.housesResource, null);

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

  private readonly submittedSearch = signal<HousesSearch | undefined>(undefined);
  private readonly tibiaHousesService = inject(TibiaHousesService);
  private readonly worldOptions = inject(WorldOptionsService);
  private readonly localization = inject(LocalizationService);

  constructor() {
    this.worldOptions.retryIfFailed();
  }

  protected setSelectedWorld(value: string): void {
    this.selectedWorld.set(value);
    this.clearResults();
  }

  protected setTown(value: string): void {
    this.town.set(value);
    this.clearResults();
  }

  protected search(): void {
    const world = this.selectedWorld().trim();
    const town = this.town().trim();
    if (!world || !town) {
      return;
    }

    this.submittedSearch.set({ world, town });
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

  private clearResults(): void {
    this.submittedSearch.set(undefined);
  }
}
