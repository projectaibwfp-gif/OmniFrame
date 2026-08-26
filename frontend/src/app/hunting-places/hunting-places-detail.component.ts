import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { buildTibiaMapUrl, DEFAULT_MAP_ZOOM } from '../tibia/tibia-map';
import { vocationClass } from '../tibia/vocation';
import { HUNTING_PLACES, type HuntingPlace } from './hunting-places.data';
import { buildHuntingDetailLabels } from './hunting-places-detail.labels';

@Component({
  selector: 'app-hunting-places-detail',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hunting-places-detail.component.html',
  styleUrl: './hunting-places-detail.component.scss',
})
export class HuntingPlacesDetailComponent {
  readonly id = input.required<string>();

  protected readonly vocationClass = vocationClass;

  protected readonly place = computed<HuntingPlace | undefined>(() =>
    HUNTING_PLACES.find((p) => p.id === this.id()),
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
    buildHuntingDetailLabels(this.localization.currentLocale() === 'pl'),
  );

  private readonly sanitizer = inject(DomSanitizer);
  private readonly localization = inject(LocalizationService);
}
