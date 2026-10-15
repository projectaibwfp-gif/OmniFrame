import { Injectable, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { resourceValueOr } from '../core/resource-value';
import { MainCharacterService } from '../services/main-character.service';
import { TibiaWorldsService } from './tibia-worlds.service';
import { buildWorldOptions } from './world-options';

/**
 * Lista światów do selectów (domy, killstatistics). Pobierana raz na sesję
 * aplikacji i współdzielona przez wszystkie widoki.
 */
@Injectable({ providedIn: 'root' })
export class WorldOptionsService {
  readonly isLoading = computed(() => this.worldsResource.isLoading());
  readonly hasError = computed(() => this.worldsResource.status() === 'error');
  readonly options = computed(() =>
    buildWorldOptions(
      this.worldsOverview()?.regularWorlds ?? [],
      this.mainCharacterService.world(),
    ),
  );

  private readonly tibiaWorldsService = inject(TibiaWorldsService);
  private readonly mainCharacterService = inject(MainCharacterService);
  private readonly worldsResource = rxResource({
    stream: () => this.tibiaWorldsService.getWorlds(),
  });
  private readonly worldsOverview = resourceValueOr(this.worldsResource, null);

  retryIfFailed(): void {
    if (this.hasError()) {
      this.worldsResource.reload();
    }
  }
}
