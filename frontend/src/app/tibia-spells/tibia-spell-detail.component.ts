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
import type { TibiaSpellDetailsDto } from '@shared/api-contract';
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
  protected readonly spell = signal<TibiaSpellDetailsDto | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);

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
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => this.loadSpell());
  }

  protected loadSpell(): void {
    this.isLoading.set(true);
    this.apiError.set(false);

    this.tibiaSpellsService
      .getSpell(this.spellId())
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.spell.set(response),
        error: () => this.apiError.set(true),
      });
  }
}
