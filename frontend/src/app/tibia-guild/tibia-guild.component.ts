import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { AppDatePipe, AppDateTimePipe } from '../core/date-time.pipe';
import { resourceValueOr } from '../core/resource-value';
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
  protected readonly guildResource = rxResource({
    params: () => this.name(),
    stream: ({ params: name }) => this.tibiaGuildService.getGuild(name),
  });
  protected readonly guild = resourceValueOr(this.guildResource, null);
  protected readonly isMembersCollapsed = signal(true);
  protected readonly isInvitesCollapsed = signal(true);

  protected readonly labels = computed(() =>
    buildGuildLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly members = computed(() => this.guild()?.members ?? []);
  protected readonly invites = computed(() => this.guild()?.invites ?? []);

  private readonly tibiaGuildService = inject(TibiaGuildService);
  private readonly localization = inject(LocalizationService);
  protected toggleMembers(): void {
    this.isMembersCollapsed.update((value) => !value);
  }

  protected toggleInvites(): void {
    this.isInvitesCollapsed.update((value) => !value);
  }
}
