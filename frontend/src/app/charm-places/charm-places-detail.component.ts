import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { CHARM_PLACES, type CharmPlace, type Vocation } from './charm-places.data';

const DEFAULT_MAP_ZOOM = 3;

interface DetailLabels {
  back: string;
  notFound: string;
  notFoundAction: string;
  creature: string;
  place: string;
  city: string;
  minLevel: string;
  vocations: string;
  description: string;
  map: string;
}

@Component({
  selector: 'app-charm-places-detail',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="charm-place-detail-page">
      @if (place(); as place) {
        <div class="detail-header">
          <a class="back-link" routerLink="/charm-places">{{ labels().back }}</a>
          <h1>{{ place.creatureName }}</h1>
          <span class="detail-place">{{ place.placeName }} · {{ place.city }}</span>
        </div>

        <div class="detail-grid">
          <div class="detail-info card">
            <div class="info-row">
              <span class="info-label">{{ labels().minLevel }}</span>
              <span class="info-value">{{ place.minLevel }}+</span>
            </div>

            <div class="info-section">
              <h3>{{ labels().vocations }}</h3>
              <div class="vocations-list">
                @for (vocation of place.recommendedVocations; track vocation) {
                  <span class="vocation-chip {{ getVocationClass(vocation) }}">{{ vocation }}</span>
                }
              </div>
            </div>

            <div class="info-section">
              <h3>{{ labels().description }}</h3>
              <p>{{ place.description }}</p>
            </div>
          </div>

          <div class="detail-map card">
            <h3>{{ labels().map }}</h3>
            <iframe
              [src]="mapUrl()"
              title="Tibia Map"
              loading="lazy"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>
        </div>
      } @else {
        <div class="not-found">
          <h2>{{ labels().notFound }}</h2>
          <a routerLink="/charm-places">{{ labels().notFoundAction }}</a>
        </div>
      }
    </div>
  `,
  styleUrl: './charm-places-detail.component.scss',
})
export class CharmPlacesDetailComponent {
  readonly id = input.required<string>();

  protected readonly place = computed<CharmPlace | undefined>(() =>
    CHARM_PLACES.find((p) => p.id === this.id()),
  );

  protected readonly mapUrl = computed<SafeResourceUrl>(() => {
    const place = this.place();
    if (!place) {
      return '';
    }
    const zoom = place.mapZoom ?? DEFAULT_MAP_ZOOM;
    const url = `https://tibiamaps.io/map/embed/#${place.coordinates.x},${place.coordinates.y},${place.coordinates.z}:${zoom}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  // eslint-disable-next-line complexity
  protected readonly labels = computed<DetailLabels>(() => {
    const isPl = this.localization.currentLocale() === 'pl';
    return {
      back: isPl ? '← Wróć do listy' : '← Back to list',
      notFound: isPl ? 'Nie znaleziono miejsca' : 'Place not found',
      notFoundAction: isPl ? 'Wróć do listy' : 'Back to list',
      creature: isPl ? 'Potwór' : 'Creature',
      place: isPl ? 'Miejsce' : 'Place',
      city: isPl ? 'Miasto' : 'City',
      minLevel: isPl ? 'Min. poziom' : 'Min level',
      vocations: isPl ? 'Profesje' : 'Vocations',
      description: isPl ? 'Opis' : 'Description',
      map: isPl ? 'Lokalizacja na mapie' : 'Location on map',
    };
  });

  private readonly sanitizer = inject(DomSanitizer);
  private readonly localization = inject(LocalizationService);

  protected getVocationClass(vocation: Vocation): string {
    const map: Record<Vocation, string> = {
      Knight: 'vocation-knight',
      Paladin: 'vocation-paladin',
      Druid: 'vocation-druid',
      Sorcerer: 'vocation-sorcerer',
      Monk: 'vocation-monk',
    };
    return map[vocation];
  }
}
