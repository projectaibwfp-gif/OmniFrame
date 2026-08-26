import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { DEFAULT_MAP_ZOOM, buildTibiaMapUrl } from '../tibia/tibia-map';
import { vocationClass } from '../tibia/vocation';
import { CHARM_PLACES, type CharmPlace } from './charm-places.data';
import { buildCharmDetailLabels } from './charm-places-detail.labels';

@Component({
  selector: 'app-charm-places-detail',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './charm-places-detail.component.html',
  styleUrl: './charm-places-detail.component.scss',
})
export class CharmPlacesDetailComponent {
  readonly id = input.required<string>();

  protected readonly vocationClass = vocationClass;

  protected readonly place = computed<CharmPlace | undefined>(() =>
    CHARM_PLACES.find((p) => p.id === this.id()),
  );

  protected readonly mapUrl = computed<SafeResourceUrl>(() => {
    const place = this.place();
    if (!place) {
      return '';
    }
    const url = buildTibiaMapUrl(place.coordinates, place.mapZoom ?? DEFAULT_MAP_ZOOM);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected readonly labels = computed(() =>
    buildCharmDetailLabels(this.localization.currentLocale() === 'pl'),
  );

  private readonly sanitizer = inject(DomSanitizer);
  private readonly localization = inject(LocalizationService);
}
