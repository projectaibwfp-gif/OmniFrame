import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizationService } from '../services/localization.service';
import { CHARM_PLACES, type CharmPlace, type Vocation } from './charm-places.data';

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
  standalone: true,
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
  styles: `
    :host {
      display: block;
    }

    .charm-place-detail-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .detail-header {
      display: flex;
      flex-direction: column;
      gap: 8px;

      h1 {
        margin: 0;
        color: var(--text-700);
        font-size: clamp(24px, 3vw, 30px);
      }
    }

    .back-link {
      align-self: flex-start;
      color: var(--brand-primary);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .detail-place {
      color: var(--text-500);
      font-size: 14px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 380px) 1fr;
      gap: 20px;
      align-items: start;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .card {
      padding: 20px;
      background: var(--surface-card-overlay);
      border: 1px solid var(--border-translucent);
      border-radius: 16px;
      box-shadow: 0 12px 24px var(--shadow-medium);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-subtle);
    }

    .info-label {
      color: var(--text-400);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .info-value {
      color: var(--text-700);
      font-size: 14px;
      font-weight: 600;
    }

    .info-section {
      margin-top: 20px;

      h3 {
        margin: 0 0 10px;
        color: var(--text-700);
        font-size: 14px;
      }

      p {
        margin: 0;
        color: var(--text-500);
        font-size: 14px;
        line-height: 1.5;
      }
    }

    .vocations-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .vocation-chip {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;

      &.vocation-knight {
        background: #fde9ea;
        color: #9c1c1c;
      }

      &.vocation-paladin {
        background: #e8f5ee;
        color: #057642;
      }

      &.vocation-druid {
        background: #eef4fb;
        color: #4b81c8;
      }

      &.vocation-sorcerer {
        background: #fdeceb;
        color: #b24c3b;
      }

      &.vocation-monk {
        background: #fff5e8;
        color: #b7791f;
      }
    }

    .detail-map {
      iframe {
        width: 100%;
        height: 480px;
        border: 0;
        border-radius: 12px;
        background: #1a1a1a;
      }

      h3 {
        margin: 0 0 12px;
        color: var(--text-700);
        font-size: 14px;
      }
    }

    .not-found {
      text-align: center;
      padding: 40px;

      h2 {
        margin: 0 0 16px;
        color: var(--text-700);
      }

      a {
        color: var(--brand-primary);
        font-weight: 600;
      }
    }
  `,
})
export class CharmPlacesDetailComponent {
  readonly id = input.required<string>();

  protected readonly place = computed<CharmPlace | undefined>(() =>
    CHARM_PLACES.find((p) => p.id === this.id()),
  );

  protected readonly mapUrl = computed(() => {
    const place = this.place();
    if (!place) {
      return '';
    }
    const zoom = place.mapZoom ?? 3;
    return `https://tibiamaps.io/map/embed/#${place.coordinates.x},${place.coordinates.y},${place.coordinates.z}:${zoom}`;
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
