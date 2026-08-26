# AGENTS.md - frontend (Angular 22 + Vite)

Zasady specyficzne dla `frontend/`. Zasady globalne (Clean Code, quality gate,
kontrakty API, mapa dokumentacji) są w `AGENTS.md` w katalogu głównym repo.

Uzupełniająca dokumentacja: `frontend/README.md` (konfiguracja, routing, CORS,
Google OAuth), `frontend/I18N_QUICKSTART.md` (tłumaczenia), `README.md` (całość
projektu).

## API Angulara - tylko nowoczesna składnia

1. Używaj signal-based API: `signal()`, `computed()`, `effect()`, `input()`,
   `output()`, `model()`, `viewChild.required()`, `contentChild()`.
2. **Nie używaj** dekoratorów `@ViewChild` / `@Input` / `@Output` - zastąp je
   odpowiednikami sygnałowymi.
3. DI wyłącznie przez `inject()` - bez wstrzykiwania przez konstruktor.
4. Do inicjalizacji zależnej od DOM używaj `afterNextRender()`, nie `ngAfterViewInit`.
5. Efekty uboczne reagujące na sygnały -> `effect()` w konstruktorze.
6. Każdy komponent ma `changeDetection: ChangeDetectionStrategy.OnPush`.
7. **Pomijaj `standalone: true`** - to domyślne od Angulara 19+.
8. W szablonach używaj nowej składni control flow: `@if`, `@for`, `@switch`
   (nie `*ngIf` / `*ngFor`).
9. W `imports` komponentu wpisuj tylko to, czego szablon faktycznie używa
   (`RouterLink`, `DatePipe`, `FormsModule`), nigdy całego `CommonModule` /
   `RouterModule` "na zapas".

## Modyfikatory dostępu

10. `private readonly` dla pól wewnętrznych.
11. `protected readonly` dla pól i metod używanych w szablonie - szablon
    komponentu ma dostęp do `protected`.
12. `public` tylko dla prawdziwego API komponentu (np. `input()` / `output()`).

## Struktura plików komponentu

13. Zawsze rozdzielaj komponent na osobne pliki `.ts` (logika), `.html` (szablon)
    i `.scss` (styl). Używaj `templateUrl:` i `styleUrl:`, nie inline `template:`
    ani `styles:`.
14. Powiązane komponenty grupuj w podkatalogach
    (np. `src/app/components/language-switcher/`).

## Subskrypcje i nawigacja

15. Subskrypcje długo żyjących strumieni (np. `route.params`) domykaj przez
    `takeUntilDestroyed()` z `@angular/core/rxjs-interop`.
16. `router.navigate(...)` / `navigateByUrl(...)` zwraca Promise - jeśli nie
    czekasz na wynik, poprzedź wywołanie `void`.

## SCSS komponentów

17. **Wszystkie kolory pochodzą wyłącznie z `frontend/src/styles/_colors.scss`.**
    Import na górze pliku: `@use 'colors' as c;`, użycie: `c.$text-700` itd.
    Żaden komponent nie hardkoduje `#hex` ani `rgb()` - gdy potrzebny jest nowy
    odcień, dodaj token do palety i dopiero go referencuj.
18. Poza kolorami: pozostałe zmienne SCSS (spacing, breakpointy) na górze pliku
    pod importami.
19. Selektory potomne zagnieżdżaj pod rootem komponentu (nesting), zamiast
    płaskich `.a .b`.
20. **Wszystkie** style mobilne w **jednym** `@media (max-width: c.$bp-mobile)`
    (575.98px, zgodne z Bootstrap `sm`) na końcu pliku.
21. Nie używaj gołych selektorów typu `h1`, `p` na poziomie pliku - zawsze
    scope'uj je pod komponent.

## i18n

22. Frontend wspiera angielski (`en`) i polski (`pl`). Tłumaczenia dodawaj w
    `src/i18n/messages.{en,pl}.xlf`.
23. Aktualny locale i przełączanie języka obsługuje `LocalizationService`.
    Language switcher jest w topbarze. Etykiety nawigacji i teksty statyczne
    muszą reagować na sygnał locale. Szczegóły: `frontend/I18N_QUICKSTART.md`.

## Dark mode

24. Motywem zarządza `ThemeService` - wykrywa preferencję systemową
    (`prefers-color-scheme`), zapisuje wybór w `localStorage` i aplikuje motyw
    przez selektor `html[data-theme="dark"]`.
25. Style dark mode trzymaj w `src/styles.scss` w sekcji `/* Dark Mode */`.

## Dane stron Tibia

26. `/boosted` korzysta z `GET /api/boostable-bosses` i DTO `BoostableBossDto` /
    `BoostableBossesDto` z `shared/api-contract.ts`.
27. Lista creature i boostowany potwór: `GET /api/creatures`, DTO
    `TibiaCreatureDto` / `TibiaCreaturesDto`.
28. `/character` renderuje dane postaci, blok dokładnego EXP z highscores oraz
    tabelę historii sprawdzeń zwracaną przez backend.
29. `/news` pobiera dane przez `GET /api/news` (cache 15 minut po stronie backendu).
30. Statyczne zbiory danych stron Tibia (`hunting-places.data.ts`,
    `charm-places.data.ts`, `quests.data.ts`) trzymaj obok komponentu feature'a,
    a filtrowanie/sortowanie/paginację buduj na `computed()`.

## Artefakty

31. Nie commituj `frontend/out-tsc/` ani `frontend/dist/` - są ignorowane w Git.
