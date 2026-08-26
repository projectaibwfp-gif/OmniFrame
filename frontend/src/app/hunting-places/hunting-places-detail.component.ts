import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { HUNTING_PLACES, type HuntingPlace, type Vocation } from './hunting-places.data';

const DEFAULT_MAP_ZOOM = 3;

interface DetailLabels {
  back: string;
  notFound: string;
  notFoundAction: string;
  level: string;
  city: string;
  access: string;
  premium: string;
  free: string;
  profit: string;
  experience: string;
  creatures: string;
  vocations: string;
  description: string;
  map: string;
  low: string;
  medium: string;
  high: string;
}

@Component({
  selector: 'app-hunting-places-detail',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hunting-place-detail-page">
      @if (place(); as place) {
        <div class="detail-header">
          <a class="back-link" routerLink="/hunting-places">{{ labels().back }}</a>
          <h1>{{ place.name }}</h1>
          <span class="detail-city">{{ place.city }}</span>
        </div>

        <div class="detail-grid">
          <div class="detail-info card">
            <div class="info-row">
              <span class="info-label">{{ labels().level }}</span>
              <span class="info-value">{{ place.minLevel }} - {{ place.maxLevel }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ labels().access }}</span>
              <span class="info-value">
                {{ place.premium ? labels().premium : labels().free }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ labels().profit }}</span>
              <span class="info-value profit-{{ place.profit }}">
                {{ labels()[place.profit] }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ labels().experience }}</span>
              <span class="info-value exp-{{ place.experience }}">
                {{ labels()[place.experience] }}
              </span>
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
              <h3>{{ labels().creatures }}</h3>
              <ul class="creatures-list">
                @for (creature of place.creatures; track creature) {
                  <li>{{ creature }}</li>
                }
              </ul>
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
          <a routerLink="/hunting-places">{{ labels().notFoundAction }}</a>
        </div>
      }
    </div>
  `,
  styleUrl: './hunting-places-detail.component.scss',
})
export class HuntingPlacesDetailComponent {
  readonly id = input.required<string>();

  protected readonly place = computed<HuntingPlace | undefined>(() =>
    HUNTING_PLACES.find((p) => p.id === this.id()),
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
      level: isPl ? 'Poziom' : 'Level',
      city: isPl ? 'Miasto' : 'City',
      access: isPl ? 'Dostęp' : 'Access',
      premium: isPl ? 'Premium' : 'Premium',
      free: isPl ? 'Darmowy' : 'Free',
      profit: isPl ? 'Profit' : 'Profit',
      experience: isPl ? 'EXP' : 'EXP',
      creatures: isPl ? 'Potwory' : 'Creatures',
      vocations: isPl ? 'Profesje' : 'Vocations',
      description: isPl ? 'Opis' : 'Description',
      map: isPl ? 'Lokalizacja na mapie' : 'Location on map',
      low: isPl ? 'Niski' : 'Low',
      medium: isPl ? 'Średni' : 'Medium',
      high: isPl ? 'Wysoki' : 'High',
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
