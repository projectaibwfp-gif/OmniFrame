# AGENTS.md - główny plik kontekstu OmniFrame

To jest **punkt wejścia dla każdego agenta** pracującego w tym repo. Zawiera mapę
dokumentacji i zasady obowiązujące w całym monorepo. Zasady specyficzne dla
aplikacji są w `frontend/AGENTS.md` i `backend/AGENTS.md`.

## Zanim zaczniesz - co przeczytać

Zawsze przeczytaj ten plik. Dodatkowo, zależnie od zakresu zadania:

| Zakres zadania                | Obowiązkowa lektura                                    |
| ----------------------------- | ------------------------------------------------------ |
| dowolny                       | `AGENTS.md` (ten plik), `README.md`                    |
| zmiany w `frontend/**`        | `frontend/AGENTS.md`, `frontend/README.md`             |
| zmiany w `backend/**`         | `backend/AGENTS.md`, `backend/README.md`               |
| zmiany w `shared/**`          | `frontend/AGENTS.md` + `backend/AGENTS.md` (oba naraz) |
| i18n / tłumaczenia            | `frontend/I18N_QUICKSTART.md`                          |
| cron, highscores, harmonogram | `backend/CRON.md`                                      |

## Mapa dokumentacji

| Plik                              | Zawartość                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| `AGENTS.md`                       | **ten plik** - mapa dokumentacji, zasady globalne, Clean Code, quality gate                   |
| `README.md`                       | uruchomienie projektu, struktura, pełna lista endpointów, deployment Vercel, proces release'u |
| `frontend/AGENTS.md`              | zasady Angulara 22 (signals, DI, control flow), SCSS, i18n, dark mode, konwencje komponentów  |
| `frontend/README.md`              | konfiguracja i uruchomienie frontendu, routing, integracja z API, CORS, Google OAuth          |
| `frontend/I18N_QUICKSTART.md`     | jak dodać tłumaczenie, API `LocalizationService`, language switcher, build z i18n             |
| `backend/AGENTS.md`               | zasady Next.js App Router, nazewnictwo route'ów i testów, SQL/Neon, logger, walidacja         |
| `backend/README.md`               | konfiguracja i uruchomienie backendu, zmienne środowiskowe, lista endpointów, komendy         |
| `backend/CRON.md`                 | konfiguracja i harmonogram crona highscores, monitoring, testowanie lokalne, troubleshooting  |
| `.github/copilot-instructions.md` | wskaźnik na te pliki dla GitHub Copilot (nie duplikuj tam zasad)                              |

Kontrakty i konfiguracja współdzielona (nie markdown, ale źródło prawdy):

| Plik                       | Rola                                                        |
| -------------------------- | ----------------------------------------------------------- |
| `shared/api-contract.ts`   | źródło prawdy dla DTO API współdzielonych front <-> backend |
| `shared/runtime-config.ts` | konfiguracja runtime wspólna dla obu aplikacji              |
| `shared/api/swagger.json`  | lokalny snapshot specyfikacji TibiaData API (v4)            |
| `releases.yaml`            | generowany automatycznie changelog wersji obu aplikacji     |

## Struktura repo

```text
OmniFrame/
├── frontend/   # Angular 22 + Vite (@analogjs/vite-plugin-angular), Vitest
├── backend/    # Next.js 16 App Router, Neon Postgres, jose JWT, Vitest
├── shared/     # wspólne DTO/kontrakty API importowane przez oba appy (@shared/*)
├── scripts/    # release.mjs - generator wersji i releases.yaml
├── .github/    # workflows (release) + copilot-instructions.md
└── .husky/     # pre-commit hook -> lint-staged -> prettier --write
```

`frontend` i `backend` to **niezależne aplikacje** z własnymi `package.json`,
`node_modules`, configami ESLint/Prettier i własnym wersjonowaniem.

## Quality gate - obowiązkowo przed zakończeniem zadania

1. Po każdej zmianie plików uruchom `npm run format:check` w dotkniętej aplikacji.
   Jeśli nie przechodzi, uruchom `npm run format` i kontynuuj tylko gdy
   `format:check` przechodzi.
2. Przed zakończeniem zadania zweryfikuj **obie** aplikacje:

   ```bash
   cd frontend && npm run format:check && npm run lint && npm run build && npm run test
   cd ../backend && npm run format:check && npm run lint && npm run build && npm run test
   ```

3. Jeśli którekolwiek sprawdzenie nie przechodzi, uruchom komendę naprawczą
   (`npm run format`, w razie potrzeby `npm run lint:fix`) i powtarzaj do zieleni.
4. Lint działa z `--max-warnings=0` - ostrzeżenie jest błędem.
5. Nie oznaczaj zadania jako ukończonego przy czerwonym teście lub buildzie.

## Clean Code - obowiązuje w obu aplikacjach

- Jedna funkcja = jedno zadanie. Długie metody rozbijaj na małe, prywatne,
  mówiące własną nazwą (np. `captureReferralIfPresent()`, `renderGoogleButton()`).
- Nazwy opisowe, bez skrótów.
- Wczesne `return` zamiast zagnieżdżonych `if`.
- **Bez magic numbers i magic stringów** - wynoś do nazwanych stałych na poziomie
  modułu (lub zmiennych SCSS w stylach).
- Bez komentarzy tłumaczących "co robi kod" - kod ma być samoopisujący.
  Komentarze tylko tam, gdzie tłumaczą **dlaczego** (ukryte ograniczenie,
  nieoczywisty invariant, obejście konkretnego buga).
- Nie duplikuj logiki - wspólny kod wynoś do jednego miejsca.
- Async: `async/await` + `try/catch`. Jeżeli świadomie ignorujemy Promise,
  poprzedzamy go `void`.
- Bez `any`. Preferuj typy z `shared/api-contract.ts`.
- Typy używane wyłącznie w pozycjach typowych importuj przez `import type`
  albo inline `type` (`import { NextResponse, type NextRequest } from ...`).

## Format czasu - jeden w całym systemie

- Baza: kolumny `TIMESTAMPTZ` (`DEFAULT now()`). Kolumny `DATE` (np.
  `users.birth_date`) to daty kalendarzowe bez strefy - nie konwertujemy ich.
- API: ISO 8601 w UTC (`2026-08-26T13:36:00.000Z`). Konwersja wyłącznie przez
  `toIsoUtc()` z `backend/src/lib/date-time.ts`, w mapperze wiersza na DTO.
  Bez `to_char(...)` w SQL-u.
- Frontend: jeden format wyświetlania ze stałych w
  `frontend/src/app/core/date-time.ts`, nakładany pipe'ami `| appDateTime` /
  `| appDate`. Surowego stringa z API nie renderujemy.

Szczegóły w `README.md` (sekcja „Format czasu w całym systemie").

## Kontrakty API

- `shared/api-contract.ts` jest źródłem prawdy dla DTO współdzielonych między
  frontendem i backendem.
- DTO trzymamy w **camelCase**. `snake_case` zostaje wyłącznie przy mapowaniu
  wierszy bazy danych i na granicy SQL.
- Każdy błąd API ma jeden format: `{ "error": { "code": "...", "message": "..." } }`.
  Błędy twórz wyłącznie przez `errorResponse()`, a schemat utrzymuj zgodny
  z `backend/src/lib/openapi.ts`.
- `/api/users` zwraca wyłącznie listę. Pojedynczego użytkownika pobieraj przez
  `/api/users/:googleId`; nie zmieniaj kształtu odpowiedzi query parametrem.
- Po zmianie kontraktu aktualizuj `shared/api-contract.ts`, OpenAPI,
  test kontraktowy oraz dokumentację endpointów.
- Po dodaniu lub zmianie endpointu zaktualizuj `shared/api-contract.ts`,
  specyfikację OpenAPI (`backend/src/lib/openapi.ts`) oraz listę endpointów
  w `README.md` i `backend/README.md`.

## Zasady ogólne

- Nie zmieniaj kodu niezwiązanego z zadaniem.
- Nie twórz plików markdown (planów, notatek) w repo bez wyraźnej prośby użytkownika.
- Nie commituj artefaktów builda (`frontend/out-tsc/`, `frontend/dist/`, `backend/.next/`).
- Nie wpisuj sekretów, tokenów ani zawartości plików `.env` do kodu, commitów,
  logów ani dokumentacji.
- Po zmianie zależności uruchom `npm install` w odpowiednim katalogu i zatwierdź
  zaktualizowany `package-lock.json`.
- Commity w formacie Conventional Commits (`feat:`, `fix:`, `docs:`) - workflow
  release wylicza z nich wersje. Szczegóły w `README.md`.
- README to dokument roboczy - aktualizuj go razem ze zmianą wpływającą na
  uruchamianie, architekturę, endpointy, zmienne środowiskowe lub komendy npm.
