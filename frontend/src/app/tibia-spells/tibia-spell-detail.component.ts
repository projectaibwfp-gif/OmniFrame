import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { resourceValueOr } from '../core/resource-value';
import { LocalizationService } from '../services/localization.service';
import { TibiaSpellsService } from './tibia-spells.service';
import { buildSpellDetailLabels } from './tibia-spell-detail.labels';

@Component({
  selector: 'app-tibia-spell-detail',
  imports: [RouterLink],
  templateUrl: './tibia-spell-detail.component.html',
  styleUrl: './tibia-spell-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaSpellDetailComponent {
  readonly spellId = input.required<string>();
  protected readonly spellResource = rxResource({
    params: () => this.spellId(),
    stream: ({ params: spellId }) => this.tibiaSpellsService.getSpell(spellId),
  });
  protected readonly spell = resourceValueOr(this.spellResource, null);

  protected readonly labels = computed(() =>
    buildSpellDetailLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly spellInformation = computed(() => this.spell()?.spellInformation ?? null);
  protected readonly runeInformation = computed(() => this.spell()?.runeInformation ?? null);
  protected readonly spellTypeLabel = computed(() => {
    const info = this.spellInformation();
    if (info?.typeInstant && info?.typeRune) {
      return `${this.labels().instant} / ${this.labels().rune}`;
    }

    return info?.typeRune ? this.labels().rune : this.labels().instant;
  });

  private readonly tibiaSpellsService = inject(TibiaSpellsService);
  private readonly localization = inject(LocalizationService);
}
