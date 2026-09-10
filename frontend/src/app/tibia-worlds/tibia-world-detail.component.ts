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
import type { TibiaWorldDto } from '@shared/api-contract';
import { AppDatePipe } from '../core/date-time.pipe';
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
  protected readonly world = signal<TibiaWorldDto | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);
  protected readonly isOnlineListCollapsed = signal(true);

  protected readonly labels = computed(() =>
    buildWorldDetailLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly onlinePlayers = computed(() => this.world()?.onlinePlayers ?? []);

  private readonly tibiaWorldsService = inject(TibiaWorldsService);
  private readonly localization = inject(LocalizationService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => this.loadWorld());
  }

  protected loadWorld(): void {
    this.isLoading.set(true);
    this.apiError.set(false);

    this.tibiaWorldsService
      .getWorld(this.name())
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.world.set(response),
        error: () => this.apiError.set(true),
      });
  }

  protected toggleOnlineList(): void {
    this.isOnlineListCollapsed.update((value) => !value);
  }
}
