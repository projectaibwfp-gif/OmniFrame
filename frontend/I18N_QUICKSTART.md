# i18n Quickstart - Angular 22 Localization

## Overview

Aplikacja obsługuje dwa języki: **angielski (en)** i **polski (pl)**. Język jest przełączany dynamicznie za pośrednictwem `LocalizationService` i switcha w topbarze.

## Struktura

```
src/i18n/
  ├── messages.en.xlf    # Angielskie tłumaczenia (XLF format)
  └── messages.pl.xlf    # Polskie tłumaczenia (XLF format)

src/app/
  ├── services/
  │   └── localization.service.ts         # Zarządzanie lokalem + auto-detect
  └── components/
      └── language-switcher/
          ├── language-switcher.component.ts     # Logika komponentu
          ├── language-switcher.component.html   # Szablon HTML
          └── language-switcher.component.scss   # Style SCSS
```

## Jak dodać nową tłumaczenie?

### 1. Edytuj plik XLF

Otwórz `src/i18n/messages.{en,pl}.xlf` i dodaj nową `<trans-unit>`:

**messages.en.xlf:**

```xml
<trans-unit id="hello-world" datatype="html">
  <source>Hello World</source>
  <target>Hello World</target>
</trans-unit>
```

**messages.pl.xlf:**

```xml
<trans-unit id="hello-world" datatype="html">
  <source>Hello World</source>
  <target>Cześć Świecie</target>
</trans-unit>
```

### 2. Użyj w szablonie HTML

W komponentach Angular wykorzystuj `i18n` attribute (wbudowany Angular i18n):

```html
<h1 i18n="@@hello-world">Hello World</h1>
```

### 3. Użyj w komponencie TypeScript

Dla logiki komponentu używaj `LocalizationService`:

```typescript
import { Component, inject } from '@angular/core';
import { LocalizationService } from './services/localization.service';

@Component({...})
export class MyComponent {
  readonly localization = inject(LocalizationService);
  readonly locale = this.localization.currentLocale; // Signal<'en' | 'pl'>

  getGreeting(): string {
    return this.locale() === 'pl' ? 'Cześć' : 'Hello';
  }
}
```

## API LocalizationService

```typescript
// Get current locale (reactive signal)
const locale = localizationService.currentLocale; // Signal<'en' | 'pl'>

// Set locale
localizationService.setLocale('pl');

// Get locale (getter)
const current = localizationService.getLocale(); // 'en' | 'pl'
```

## Automatyczna detekcja

Język jest automatycznie ustawiany na podstawie preferencji przeglądarki (`navigator.language`). Jeśli przeglądarka używa polskiego (`pl-PL`), aplikacja automatycznie przełączy na polski. W innym przypadku domyślnie angielski.

## Language Switcher

Komponent `LanguageSwitcherComponent` jest już zintegrowany w topbarze aplikacji. Pozwala użytkownikowi na szybkie przełączenie między EN i PL bez przeładowania strony.

```html
<app-language-switcher></app-language-switcher>
```

## Best Practices

1. **ID muszą być unikalne**: Każdy `<trans-unit>` musi mieć unikalny `id`.
2. **Synchronizuj XLF**: Zawsze dodaj tłumaczenie do **obu** plików (`messages.en.xlf` i `messages.pl.xlf`).
3. **Używaj computed() dla dynamicznych tekstów**: Jeśli tekst zależy od locale, użyj `computed()`:

```typescript
readonly greeting = computed(() => {
  return this.locale() === 'pl' ? 'Cześć' : 'Hello';
});
```

4. **Unikaj hardkodowania**: Nigdy nie hardkoduj słów "Logout", "Dashboard" itp. — zawsze używaj tłumaczeń.

## Przykład: Pełny komponent z i18n

```typescript
import { Component, computed, inject } from '@angular/core';
import { LocalizationService } from '../../services/localization.service';

@Component({
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <p i18n="@@example-intro">Welcome to our app</p>
      <button (click)="handleClick()">
        {{ buttonLabel() }}
      </button>
    </div>
  `,
})
export class ExampleComponent {
  private readonly localization = inject(LocalizationService);
  readonly locale = this.localization.currentLocale;

  readonly buttonLabel = computed(() => {
    return this.locale() === 'pl' ? 'Kliknij mnie' : 'Click me';
  });

  handleClick(): void {
    console.log(`Button clicked in ${this.locale()} locale`);
  }
}
```

## Build i Deploy

Build standardowo tworzy jedną wersję aplikacji wspierającą oba języki. Nie ma osobnych buildów dla każdego języka — język jest wybierany runtime'owo.

```bash
npm run build
```

## Troubleshooting

### Tłumaczenie nie pojawia się w UI

- Sprawdź, czy ID w HTML (`i18n="@@id"`) zgadza się dokładnie z ID w XLF.
- Upewnij się, że dodałeś tłumaczenie do **obu** plików XLF.
- Wyczyść cache: `rm -rf dist node_modules/.cache` i rebuilduj.

### Błędy lintingu

- ESLint sprawdza komponentu — upewnij się, że metody mają type annotations:
  ```typescript
  readonly someMethod = computed(() => 'value'); // Signal/Computed
  ```

## Przydatne linki

- [Angular i18n docs](https://angular.io/guide/i18n)
- [XLIFF format](https://docs.oasis-open.org/xliff/xliff-core/v1.2/os/xliff-core-v1.2-os.html)
