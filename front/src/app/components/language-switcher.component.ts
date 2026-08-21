import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService, type Locale } from '../services/localization.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      @for (locale of locales; track locale) {
        <button
          class="lang-btn"
          [class.active]="localizationService.currentLocale() === locale"
          (click)="setLocale(locale)"
          type="button"
          [title]="locale === 'en' ? 'English' : 'Polski'"
        >
          {{ locale.toUpperCase() }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .language-switcher {
        display: flex;
        gap: 0.5rem;
      }

      .lang-btn {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--bs-gray-400);
        background: transparent;
        cursor: pointer;
        border-radius: 0.25rem;
        transition: all 0.2s ease;
        font-size: 0.875rem;
        font-weight: 500;

        &:hover {
          border-color: var(--bs-primary);
          color: var(--bs-primary);
        }

        &.active {
          background: var(--bs-primary);
          color: white;
          border-color: var(--bs-primary);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  readonly localizationService = inject(LocalizationService);
  readonly locales: Locale[] = ['en', 'pl'];
  readonly localeChanged = output<Locale>();

  setLocale(locale: Locale): void {
    this.localizationService.setLocale(locale);
    this.localeChanged.emit(locale);
  }
}
