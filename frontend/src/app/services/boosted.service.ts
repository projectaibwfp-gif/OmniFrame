import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { BoostableBossDto, TibiaCreatureDto } from '@shared/api-contract';
import { AuthService } from '../auth/auth.service';
import { BoostableBossesService } from '../boostable-bosses/boostable-bosses.service';

/**
 * Global cache of the currently boosted boss and creature from TibiaData.
 * Fetched once when the user becomes authenticated - backend keeps a 15-min
 * cache in memory so repeated hits are cheap, but the UI should read from
 * signals, not fire its own HTTP.
 */
@Injectable({ providedIn: 'root' })
export class BoostedService {
  readonly boostedBoss = signal<BoostableBossDto | null>(null);
  readonly boostedCreature = signal<TibiaCreatureDto | null>(null);
  readonly isLoading = signal(false);

  readonly hasBoosted = computed(
    () => this.boostedBoss() !== null || this.boostedCreature() !== null,
  );

  private readonly authService = inject(AuthService);
  private readonly boostableBossesService = inject(BoostableBossesService);
  private hasFetched = false;

  constructor() {
    effect(() => {
      if (!this.authService.isAuthenticated() || this.hasFetched) {
        return;
      }
      this.hasFetched = true;
      void this.refresh();
    });
  }

  async refresh(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [bosses, creatures] = await Promise.all([
        firstValueFrom(this.boostableBossesService.getBoostableBosses()),
        firstValueFrom(this.boostableBossesService.getCreatures()),
      ]);
      this.boostedBoss.set(bosses.boosted);
      this.boostedCreature.set(creatures.boosted);
    } catch (error) {
      console.warn('Could not load boosted data for topbar', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
