import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { buildCreatureDetailLabels } from './creature-detail.labels';
import {
  creatureResistanceEntries,
  findCreatureBySlug,
  type MergedCreature,
} from './creature-index';
import { AppNumberPipe } from '../core/number-format.pipe';
import { resistanceClass } from './resistance';

@Component({
  selector: 'app-creature-detail',
  imports: [RouterLink, AppNumberPipe],
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
}
