import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService, type Locale } from '../services/localization.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
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
