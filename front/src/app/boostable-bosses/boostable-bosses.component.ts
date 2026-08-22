import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import type { BoostableBossesDto } from '@shared/api-contract';
import { BoostableBossesService } from './boostable-bosses.service';

@Component({
  selector: 'app-boostable-bosses',
  templateUrl: './boostable-bosses.component.html',
  styleUrl: './boostable-bosses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoostableBossesComponent {
  protected readonly data = signal<BoostableBossesDto | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly apiError = signal(false);
  protected readonly availableBosses = computed(() => this.data()?.boostableBossList ?? []);

  private readonly boostableBossesService = inject(BoostableBossesService);

  constructor() {
    this.loadBoostableBosses();
  }

  protected loadBoostableBosses(): void {
    this.isLoading.set(true);
    this.apiError.set(false);
    this.boostableBossesService
      .getBoostableBosses()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => this.data.set(response),
        error: () => this.apiError.set(true),
      });
  }
}
