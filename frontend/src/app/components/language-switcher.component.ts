import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { LocalizationService, type Locale } from '../services/localization.service';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  readonly localeChanged = output<Locale>();

  protected readonly localizationService = inject(LocalizationService);

  protected setLocale(locale: Locale): void {
    this.localizationService.setLocale(locale);
    this.localeChanged.emit(locale);
  }
}
