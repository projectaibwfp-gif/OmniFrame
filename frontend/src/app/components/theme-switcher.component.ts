import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService, type Theme } from '../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly currentTheme = this.themeService.currentTheme;

  protected toggleTheme(): void {
    const nextTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.themeService.setTheme(nextTheme);
  }
}
