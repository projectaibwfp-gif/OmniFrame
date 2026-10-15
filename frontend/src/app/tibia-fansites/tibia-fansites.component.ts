import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import type { TibiaFansiteDto } from '@shared/api-contract';
import { resourceValueOr } from '../core/resource-value';
import { LocalizationService } from '../services/localization.service';
import { TibiaFansitesService } from './tibia-fansites.service';
import { buildFansitesLabels } from './tibia-fansites.labels';

interface FansiteSection {
  title: string;
  fansites: TibiaFansiteDto[];
}

@Component({
  selector: 'app-tibia-fansites',
  templateUrl: './tibia-fansites.component.html',
  styleUrl: './tibia-fansites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TibiaFansitesComponent {
  protected readonly fansitesResource = rxResource({
    stream: () => this.tibiaFansitesService.getFansites(),
  });
  protected readonly data = resourceValueOr(this.fansitesResource, null);

  protected readonly labels = computed(() =>
    buildFansitesLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly sections = computed<FansiteSection[]>(() => [
    { title: this.labels().promotedTitle, fansites: this.data()?.promoted ?? [] },
    { title: this.labels().supportedTitle, fansites: this.data()?.supported ?? [] },
  ]);

  private readonly tibiaFansitesService = inject(TibiaFansitesService);
  private readonly localization = inject(LocalizationService);
}
