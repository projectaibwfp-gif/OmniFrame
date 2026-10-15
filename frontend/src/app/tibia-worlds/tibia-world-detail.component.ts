import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppDatePipe } from '../core/date-time.pipe';
import { resourceValueOr } from '../core/resource-value';
import { LocalizationService } from '../services/localization.service';
import { TibiaWorldsService } from './tibia-worlds.service';
import { buildWorldDetailLabels } from './tibia-world-detail.labels';

@Component({
  selector: 'app-tibia-world-detail',
  imports: [RouterLink, AppDatePipe],
  templateUrl: './tibia-world-detail.component.html',
  styleUrl: './tibia-world-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaWorldDetailComponent {
  readonly name = input.required<string>();
  protected readonly worldResource = rxResource({
    params: () => this.name(),
    stream: ({ params: name }) => this.tibiaWorldsService.getWorld(name),
  });
  protected readonly world = resourceValueOr(this.worldResource, null);
  protected readonly isOnlineListCollapsed = signal(true);

  protected readonly labels = computed(() =>
    buildWorldDetailLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly onlinePlayers = computed(() => this.world()?.onlinePlayers ?? []);

  private readonly tibiaWorldsService = inject(TibiaWorldsService);
  private readonly localization = inject(LocalizationService);

  protected toggleOnlineList(): void {
    this.isOnlineListCollapsed.update((value) => !value);
  }
}
