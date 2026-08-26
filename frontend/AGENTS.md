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
    Tokeny zależne od motywu wskazują na custom property `--c-*`, więc nie da się
    na nich wołać funkcji Sassa (`rgba()`, `darken()`, `mix()`). Potrzebny wariant
    z alfą dodaj jako osobny token.
18. Kolory chipów profesji i kategorii questów bierz z mixinów
    `frontend/src/styles/_chips.scss` (`@use 'chips' as chips;`), nie powielaj par
    tło/tekst w komponencie.
19. Poza kolorami: pozostałe zmienne SCSS (spacing, breakpointy) na górze pliku
    pod importami.
20. Selektory potomne zagnieżdżaj pod rootem komponentu (nesting), zamiast
    płaskich `.a .b`.
21. **Wszystkie** style mobilne w **jednym** `@media (max-width: c.$bp-mobile)`
    (575.98px, zgodne z Bootstrap `sm`) na końcu pliku.
22. Nie używaj gołych selektorów typu `h1`, `p` na poziomie pliku - zawsze
    scope'uj je pod komponent.

## i18n

23. Frontend wspiera angielski (`en`) i polski (`pl`). Tłumaczenia dodawaj w
    `src/i18n/messages.{en,pl}.xlf`.
24. Aktualny locale i przełączanie języka obsługuje `LocalizationService`.
    Language switcher jest w topbarze. Etykiety nawigacji i teksty statyczne
    muszą reagować na sygnał locale. Szczegóły: `frontend/I18N_QUICKSTART.md`.

## Dark mode

25. Motywem zarządza `ThemeService` - domyślnie `dark`, zapisuje wybór w
    `localStorage` i ustawia atrybut `data-theme="dark"` na `<html>`.
26. **Komponent nie pisze własnych reguł `html[data-theme='dark']`.** Motyw
    przełącza wartości tokenów (`light-tokens` / `dark-tokens` z `_colors.scss`
    wypuszczane raz w `src/styles.scss`), więc styl oparty na tokenach flipuje
    sam. Własna reguła dark to sygnał, że gdzieś ominięto token.
27. Wyjątek to komponenty MDBootstrapa - czytają wyłącznie swoje zmienne
    `--mdb-*`. Ich mapowanie na nasze tokeny siedzi w bloku dark w
    `src/styles.scss`; nowe klasy MDB dopisuj tam, nie w komponencie.
28. Nie używaj tokenów `text-on-dark`, `text-dark-muted`, `surface-dark*` ani
    `border-dark-subtle` do zwykłego tekstu i tła - są statyczne (te same w obu
    motywach) i służą wyłącznie powierzchniom ciemnym z założenia (blok kodu,
    tło mapy). Do tekstu używaj `text-*`, do tła `surface-*`.

## Dane stron Tibia

29. `/boosted` korzysta z `GET /api/boostable-bosses` i DTO `BoostableBossDto` /
    `BoostableBossesDto` z `shared/api-contract.ts`.
30. Lista creature i boostowany potwór: `GET /api/creatures`, DTO
    `TibiaCreatureDto` / `TibiaCreaturesDto`.
31. `/character` renderuje dane postaci, blok dokładnego EXP z highscores oraz
    tabelę historii sprawdzeń zwracaną przez backend.
32. `/news` pobiera dane przez `GET /api/news` (cache 15 minut po stronie backendu).
33. Statyczne zbiory danych stron Tibia (`hunting-places.data.ts`,
    `charm-places.data.ts`, `quests.data.ts`) trzymaj obok komponentu feature'a,
    a filtrowanie/sortowanie/paginację buduj na `computed()`.
34. Nie pisz od nowa listowania - użyj gotowych klocków:
    `core/paged-list.ts` (`createPagedList(signal)`), `core/sort.ts`
    (`createSort(field, dir)`), `components/pagination/` (`<app-pagination>`),
    `tibia/vocation.ts` (`Vocation`, `VOCATIONS`, `vocationClass`),
    `tibia/tibia-map.ts` (`buildTibiaMapUrl`). Tabele etykiet i18n trzymaj w
    osobnym `*.labels.ts`, nie w komponencie.

## Artefakty

35. Nie commituj `frontend/out-tsc/` ani `frontend/dist/` - są ignorowane w Git.
