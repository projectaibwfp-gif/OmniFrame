import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import type { TibiaWorldOverviewDto } from '@shared/api-contract';
import { AppDateTimePipe } from '../core/date-time.pipe';
import { resourceValueOr } from '../core/resource-value';
import { LocalizationService } from '../services/localization.service';
import { TibiaWorldsService } from './tibia-worlds.service';
import { buildWorldsLabels } from './tibia-worlds.labels';

type WorldListKind = 'regular' | 'tournament';

interface WorldListSection {
  kind: WorldListKind;
  title: string;
  worlds: TibiaWorldOverviewDto[];
}

@Component({
  selector: 'app-tibia-worlds',
  imports: [RouterLink, AppDateTimePipe],
  templateUrl: './tibia-worlds.component.html',
  styleUrl: './tibia-worlds.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaWorldsComponent {
  protected readonly worldsResource = rxResource({
    stream: () => this.tibiaWorldsService.getWorlds(),
  });
  protected readonly data = resourceValueOr(this.worldsResource, null);

  protected readonly labels = computed(() =>
    buildWorldsLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly sections = computed<WorldListSection[]>(() => [
    {
      kind: 'regular',
      title: this.labels().regularTitle,
      worlds: this.data()?.regularWorlds ?? [],
    },
    {
      kind: 'tournament',
      title: this.labels().tournamentTitle,
      worlds: this.data()?.tournamentWorlds ?? [],
    },
  ]);

  private readonly collapsedKinds = signal<readonly WorldListKind[]>(['regular', 'tournament']);
  private readonly tibiaWorldsService = inject(TibiaWorldsService);
  private readonly localization = inject(LocalizationService);

  protected isCollapsed(kind: WorldListKind): boolean {
    return this.collapsedKinds().includes(kind);
  }

  protected toggleSection(kind: WorldListKind): void {
    this.collapsedKinds.update((kinds) =>
      kinds.includes(kind) ? kinds.filter((item) => item !== kind) : [...kinds, kind],
    );
  }
}
