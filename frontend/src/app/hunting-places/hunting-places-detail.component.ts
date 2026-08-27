import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { DEFAULT_MAP_ZOOM } from '../tibia/tibia-map';
import { TibiaMinimapComponent } from '../tibia/tibia-minimap.component';
import { vocationClass } from '../tibia/vocation';
import { HUNTING_PLACES, type HuntingMonster, type HuntingPlace } from './hunting-places.data';
import { buildHuntingDetailLabels } from './hunting-places-detail.labels';

interface ResistanceEntry {
  label: string;
  value: number;
}

const RESISTANCE_ORDER: (keyof HuntingMonster['resistances'])[] = [
  'physical',
  'fire',
  'ice',
  'energy',
  'earth',
  'holy',
  'death',
];

@Component({
  selector: 'app-hunting-places-detail',
  imports: [RouterLink, TibiaMinimapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hunting-places-detail.component.html',
  styleUrl: './hunting-places-detail.component.scss',
})
export class HuntingPlacesDetailComponent {
  readonly id = input.required<string>();

  protected readonly vocationClass = vocationClass;
  protected readonly defaultMapZoom = DEFAULT_MAP_ZOOM;

  protected readonly place = computed<HuntingPlace | undefined>(() =>
    HUNTING_PLACES.find((p) => p.id === this.id()),
  );

  protected readonly labels = computed(() =>
    buildHuntingDetailLabels(this.localization.currentLocale() === 'pl'),
  );

  private readonly localization = inject(LocalizationService);

  protected resistanceEntries(monster: HuntingMonster): ResistanceEntry[] {
    return RESISTANCE_ORDER.map((label) => ({ label, value: monster.resistances[label] }));
  }

  protected resistanceClass(value: number): string {
    if (value <= -100) {
      return 'resist-immune';
    }
    if (value < 0) {
      return 'resist-strong';
    }
    if (value > 0) {
      return 'resist-weak';
    }
    return 'resist-neutral';
  }
}
