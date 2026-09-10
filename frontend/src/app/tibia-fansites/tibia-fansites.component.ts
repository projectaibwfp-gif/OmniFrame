import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type { TibiaFansiteDto, TibiaFansitesDto } from '@shared/api-contract';
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
  protected readonly data = signal<TibiaFansitesDto | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);

  protected readonly labels = computed(() =>
    buildFansitesLabels(this.localization.currentLocale() === 'pl'),
  );
  protected readonly sections = computed<FansiteSection[]>(() => [
    { title: this.labels().promotedTitle, fansites: this.data()?.promoted ?? [] },
    { title: this.labels().supportedTitle, fansites: this.data()?.supported ?? [] },
  ]);

  private readonly tibiaFansitesService = inject(TibiaFansitesService);
  private readonly localization = inject(LocalizationService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadFansites();
  }

  protected loadFansites(): void {
    this.isLoading.set(true);
    this.apiError.set(false);

    this.tibiaFansitesService
      .getFansites()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.data.set(response),
        error: () => this.apiError.set(true),
      });
  }
}
