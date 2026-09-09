import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { buildCreatureDetailLabels } from './creature-detail.labels';
import {
  creatureResistanceEntries,
  findCreatureBySlug,
  resistanceClass,
  type MergedCreature,
} from './creature-index';

@Component({
  selector: 'app-creature-detail',
  imports: [RouterLink],
  templateUrl: './creature-detail.component.html',
  styleUrl: './creature-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatureDetailComponent {
  readonly slug = input.required<string>();

  protected readonly labels = computed(() =>
    buildCreatureDetailLabels(this.localization.currentLocale() === 'pl'),
  );

  protected readonly creature = computed<MergedCreature | null>(() =>
    findCreatureBySlug(this.slug()),
  );

  protected readonly resistanceEntries = creatureResistanceEntries;
  protected readonly resistanceClass = resistanceClass;

  private readonly localization = inject(LocalizationService);

  protected formatMarketValue(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }
}
