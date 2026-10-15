import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { throwError } from 'rxjs';
import { AppDateTimePipe } from '../core/date-time.pipe';
import { resourceValueOr } from '../core/resource-value';
import { LocalizationService } from '../services/localization.service';
import { TibiaHousesService } from './tibia-houses.service';
import { buildHouseDetailLabels } from './tibia-house-detail.labels';

const MIN_HOUSE_ID = 1;
const INVALID_HOUSE_ID_MESSAGE = 'Invalid house id';

interface HouseRequest {
  world: string;
  houseId: number;
}

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
  protected readonly houseResource = rxResource({
    params: (): HouseRequest => ({ world: this.world(), houseId: Number(this.houseId()) }),
    stream: ({ params }) =>
      isValidHouseId(params.houseId)
        ? this.tibiaHousesService.getHouse(params.world, params.houseId)
        : throwError(() => new Error(INVALID_HOUSE_ID_MESSAGE)),
  });
  protected readonly house = resourceValueOr(this.houseResource, null);

  protected readonly labels = computed(() =>
    buildHouseDetailLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly worldName = computed(() => this.house()?.world ?? this.world());

  private readonly tibiaHousesService = inject(TibiaHousesService);
  private readonly localization = inject(LocalizationService);
}

function isValidHouseId(houseId: number): boolean {
  return Number.isFinite(houseId) && houseId >= MIN_HOUSE_ID;
}
