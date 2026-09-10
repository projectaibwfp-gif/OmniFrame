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
import type { TibiaGuildDto } from '@shared/api-contract';
import { AppDatePipe, AppDateTimePipe } from '../core/date-time.pipe';
import { LocalizationService } from '../services/localization.service';
import { TibiaGuildService } from './tibia-guild.service';
import { buildGuildLabels } from './tibia-guild.labels';

@Component({
  selector: 'app-tibia-guild',
  imports: [RouterLink, AppDatePipe, AppDateTimePipe],
  templateUrl: './tibia-guild.component.html',
  styleUrl: './tibia-guild.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaGuildComponent {
  readonly name = input.required<string>();
  protected readonly guild = signal<TibiaGuildDto | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);
  protected readonly isMembersCollapsed = signal(true);
  protected readonly isInvitesCollapsed = signal(true);

  protected readonly labels = computed(() =>
    buildGuildLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly members = computed(() => this.guild()?.members ?? []);
  protected readonly invites = computed(() => this.guild()?.invites ?? []);

  private readonly tibiaGuildService = inject(TibiaGuildService);
  private readonly localization = inject(LocalizationService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => this.loadGuild());
  }

  protected loadGuild(): void {
    this.isLoading.set(true);
    this.apiError.set(false);

    this.tibiaGuildService
      .getGuild(this.name())
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.guild.set(response),
        error: () => this.apiError.set(true),
      });
  }

  protected toggleMembers(): void {
    this.isMembersCollapsed.update((value) => !value);
  }

  protected toggleInvites(): void {
    this.isInvitesCollapsed.update((value) => !value);
  }
}
