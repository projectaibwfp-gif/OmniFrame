# OmniFrame

Starter aplikacji z frontendem Angular 22 + Vite, backendem REST Next.js 16
oraz Neon Postgres. `front` i `backend` są niezależnymi aplikacjami,
uruchamianymi w osobnych terminalach.

Aktualny stan: Angular 22 budowany przez Vite
(`@analogjs/vite-plugin-angular`), Next.js 16.3.0 oraz backend TypeScript,
w tym runner migracji. Neon korzysta z HTTPS/443, więc działa też w sieciach
blokujących port 5432.

## Struktura

```text
OmniFrame/
├── front/       # Angular 22 + Vite, dashboard i routing
└── backend/     # Next.js 16 App Router, TypeScript REST API + migracje SQL
├── shared/      # Wspólne DTO/kontrakty API importowane przez front i backend
```

Najważniejsze pliki:

```text
front/src/app/                 # layout, routing, dashboard, profil, użytkownicy
front/vite.config.ts           # Vite + plugin Angulara, proxy /api na dev
backend/src/app/api/health/    # kontrola API i połączenia z bazą
backend/src/app/api/dashboard/ # statystyki dashboardu oparte o użytkowników
backend/src/app/api/products/  # odczyt i tworzenie projektów
backend/src/app/api/users/     # lista użytkowników, rejestracje i role
backend/src/app/api/auth/      # Google login, sesja, refresh, logout, me
backend/src/app/api/referrals/ # przechwytywanie linków polecających
backend/src/lib/db.ts          # klient Neon (DATABASE_URL)
backend/src/lib/auth.ts        # weryfikacja Google, JWT cookie, upsert users
backend/src/lib/referral.ts    # cookie referral + walidacja kodów
backend/scripts/migrate.ts     # TypeScript runner migracji (tabela _migrations)
backend/migration/001_init.sql # tabela projects
backend/migration/002_seed.sql # dane przykładowe (idempotentne)
backend/migration/005_user_referrals.sql # przypisanie poleceń + tabela atrybucji
backend/migration/006_referral_codes.sql # stałe hashe referral_code dla users
```

## Wymagania

- Node.js 22.22.3 lub nowszy
- npm 10+
- Konto Neon (lub inny hosted Postgres z dostępem po HTTPS)

## Rejestr npm

Projekt korzysta wyłącznie z publicznego rejestru npm:

- `front/.npmrc` - `https://registry.npmjs.org/`,
- `backend/.npmrc` - `https://registry.npmjs.org/`.

Po zmianie zależności uruchamiaj `npm install` w odpowiednim katalogu,
a następnie zatwierdzaj zaktualizowany `package-lock.json`.

## Uruchomienie krok po kroku

### 1. Skonfiguruj bazę i uruchom migracje

```bash
cd backend
cp .env.example .env   # uzupełnij DATABASE_URL (connection string z Neona)
npm install
npm run db:migrate
```

Runner `scripts/migrate.ts` tworzy tabelę `_migrations` i aplikuje po kolei
wszystkie nowe pliki `backend/migration/*.sql` (posortowane po nazwie).
Powtórne uruchomienie pomija już zaaplikowane migracje.

Zasady pisania migracji:

- nazwy numerowane rosnąco: `003_opis.sql`, `004_opis.sql`, ...
- statementy kończą się średnikiem na końcu linii (plik jest dzielony
  na pojedyncze statementy, bo driver HTTP Neona wykonuje je pojedynczo)
- bez ciał funkcji PL/pgSQL `$$ ... $$` (zawierają średniki w środku)
- pisz idempotentnie (`IF NOT EXISTS`, guardy) - brak transakcji na cały plik

### 2. Uruchom backend

```bash
cd backend
npm run dev
```

Backend będzie dostępny pod `http://localhost:3000`. Plik `backend/.env` jest
ignorowany przez Git i nie należy wpisywać jego zawartości do README, commitów
ani logów.

Konfiguracja (`backend/.env`, na podstawie `backend/.env.example`):

| Zmienna        | Znaczenie                                                        |
| -------------- | ---------------------------------------------------------------- |
| `DATABASE_URL` | connection string Postgres/Neon (host pooler, `sslmode=require`) |
| `GOOGLE_CLIENT_ID` | client ID Google używany do weryfikacji ID tokena             |

Endpointy:

- `GET /api/health` - sprawdza API i połączenie z bazą,
- `GET /api/dashboard` - metryki dashboardu: konta Google, logowania dziś, rejestracje, polecenia, top referrerzy,
- `GET /api/auth/state` - tworzy i zapisuje stan logowania Google,
- `POST /api/auth/google` - loguje przez Google, ustawia cookie sesji i refresh,
- `GET /api/auth/me` - zwraca aktualną sesję użytkownika,
- `POST /api/auth/refresh` - odnawia sesję z refresh cookie,
- `POST /api/auth/logout` - czyści cookie sesji,
- `GET /api/products` - zwraca ostatnie projekty z bazy,
- `POST /api/products` - tworzy projekt,
- `POST /api/referrals/capture` - odkłada pierwszy referral do cookie i nie nadpisuje go,
- `GET /api/users` - lista użytkowników lub pojedynczy user po `google_id`,
- `POST /api/users` - ręczny upsert użytkownika Google.

Format danych dla `POST /api/products`:

```json
{
  "name": "Nowy projekt",
  "category": "Operations",
  "status": "draft"
}
```

Pole `name` jest wymagane, `status` może mieć wartość `active` albo `draft`,
a domyślna kategoria to `General`. Zapytania SQL używają parametrów, aby
ograniczyć ryzyko SQL injection.

### Auth + referral flow

1. Frontend pobiera `GET /api/auth/state`, renderuje przycisk Google i wysyła
   ID token do `POST /api/auth/google`.
2. Backend weryfikuje token Google, zapisuje/aktualizuje rekord `users`,
   zakłada ciasteczka `omniframe.session` i `omniframe.refresh`, a następnie
   wystawia sesję przez `GET /api/auth/me`.
3. Wejście przez link `.../login?ref=<hash>` trafia do
   `POST /api/referrals/capture`, który zapisuje referral do cookie
   `omniframe.referral`.
4. Referral zapisuje się **tylko raz** przy pierwszej rejestracji użytkownika:
   do `users.referred_by_code` oraz do tabeli `user_referral_attributions`.
5. Każdy użytkownik ma własny, stały `users.referral_code` (hash md5 oparty o
   `google_id`) i własny link polecający pokazywany w profilu.

### 3. Uruchom frontend

```bash
cd front
cp .env.example .env
npm install
npm run dev
```

Frontend będzie dostępny pod `http://localhost:4200`. Bazowy adres API jest
trzymany globalnie w `front/.env` jako `VITE_API_BASE_URL` (domyślnie
`/api`) i wykorzystywany przez komponenty
dashboardu oraz listy produktów.

Logowanie przez Google jest obsługiwane po stronie backendu: frontend wysyła
Google ID token do `/api/auth/google`, backend go weryfikuje, ustawia cookie
sesji `HttpOnly` i trzyma stan użytkownika przez `/api/auth/me`.

W trybie dev Vite proxy przekazuje `/api/*` do
`https://apiomniframe.vercel.app`, a na Vercel działa rewrite `/api/*` -> backend.
Dzięki temu frontend nie woła cross-origin bezpośrednio i nie wpada w CORS.

## Routing frontendu

- `/` - dashboard z metrykami, wykresem, akcjami oraz tabelą projektów,
- `/products` - podstrona z listą produktów pobieraną z API,
- `/users` - lista użytkowników z oznaczeniem kont z polecenia,
- `/profile` - dane bieżącego użytkownika i link polecający z kopiowaniem,
- `/about` - opis warstw aplikacji.

Routing używa lazy-loaded standalone components. Dashboard pobiera dane z
`GET /api/dashboard`, lista użytkowników z `GET /api/users`, a komponent profilu
pracuje na danych sesji zwracanych przez `GET /api/auth/me`.

Dashboard nie korzysta już z przykładowych liczb - pokazuje:

- liczbę wszystkich kont Google,
- liczbę logowań dzisiaj,
- liczbę nowych kont z dzisiaj,
- liczbę i udział kont z polecenia,
- aktywność z 7 dni,
- ostatnie logowania,
- ranking najskuteczniejszych polecających.

## Testy

### Frontend

```bash
cd front
npm run test
```

### Backend

```bash
cd backend
npm install
npm run test
```

Backend używa Vitest. Testy obejmują każdy route w `backend/src/app/api/**`
i pokrywają co najmniej dwa scenariusze na endpoint (ścieżki sukcesu i błędu /
autoryzacji / walidacji, zależnie od route'a).

## Wdrożenie (Vercel)

Repo jest wdrażane jako dwa projekty Vercel:

- **frontend**: Root Directory `front`, framework Vite; `front/vercel.json`
  ustawia build, output `dist`, rewrite `/api/*` na backend oraz nagłówki
  bezpieczeństwa (CSP, `X-Frame-Options` itd.),
- **backend**: Root Directory `backend`, framework Next.js; zmienna
  środowiskowa `DATABASE_URL` (Production + Preview).

Migracje nie uruchamiają się podczas builda Vercel. Przed wdrożeniem zmian
schematu uruchom `npm run db:migrate` lokalnie przeciwko bazie produkcyjnej.

## Automatyczne release

Repo używa GitHub Actions do automatycznego budowania i wersjonowania zmian.
Workflow znajduje się w `.github/workflows/release.yml` i uruchamia się po
każdym pushu bezpośrednio do `main`.

### Użycie

Pisz commity w formacie:

```text
feat: add product filtering
fix: handle empty products response
docs: update API documentation
```

Następnie wypchnij zmianę:

```bash
git add .
git commit -m "feat: add product filtering"
git push origin main
```

Nie trzeba ręcznie zmieniać wersji ani tworzyć `releases.yaml`.

### Co dzieje się po pushu

GitHub Actions wykonuje kolejno:

1. Buduje frontend przez `npm ci` i `npm run build`.
2. Buduje backend przez `npm ci` i `npm run build`.
3. Dla obu aplikacji uruchamia też `npm run lint` i `npm run format:check`.
4. Jeśli wszystkie sprawdzenia przejdą, analizuje osobno frontend i backend.
5. Dla każdej aplikacji pobiera jej ostatni tag i zbiera commity dotyczące
   odpowiedniego katalogu.
6. Wylicza osobne wersje:

   | Commit                         | Zmiana wersji            |
   | ------------------------------ | ------------------------ |
   | `feat:`                        | minor, `0.1.0` → `0.2.0` |
   | pozostałe, np. `fix:`, `docs:` | patch, `0.1.0` → `0.1.1` |
   | `feat!:` lub `BREAKING CHANGE` | major, `0.1.0` → `1.0.0` |

7. Aktualizuje tylko zmienione aplikacje:

   ```text
   zmiany w front/**   → front/package.json
   zmiany w backend/** → backend/package.json
   ```

8. Generuje `releases.yaml` z aktualną wersją obu aplikacji, nawet gdy tylko
   jedna z nich została podbita.
9. Tworzy osobne tagi:

   ```text
   front-v0.2.0
   backend-v0.1.1
   ```

10. Tworzy commit release i wypycha go razem z tagami do `main`.

Zmiana tylko w `front/**` nie podbija wersji backendu. Zmiana tylko w
`backend/**` nie podbija wersji frontendu. Zmiany w obu katalogach tworzą
release obu aplikacji. Zmiany wyłącznie w katalogu głównym, np. README, nie
tworzą nowego release.

Każdy wpis `releases.yaml` zawiera oba komponenty. Niezmieniony komponent ma
`changed: false`, aktualną wersję i pustą listę commitów.

Jeśli aplikacja nie ma jeszcze własnego taga, generator używa poprzedniego SHA
pushu jako punktu odniesienia. Nie analizuje całej historii drugiej aplikacji.

Commit wygenerowany automatycznie ma format:

```text
chore: release frontend, backend [skip ci]
```

`[skip ci]` oraz użycie `GITHUB_TOKEN` zapobiegają uruchomieniu kolejnego
release dla automatycznego commita.

### Przykład `releases.yaml`

```yaml
releases:
  - date: "2026-08-07T12:00:00.000Z"
    commit: "a1b2c3d4..."
    frontend:
      version: "0.2.0"
      tag: "front-v0.2.0"
      changed: true
      commits:
        - hash: "a1b2c3d4"
          author: "Filip"
          date: "2026-08-07T11:55:00.000Z"
          message: "feat: add product filtering"
    backend:
      version: "0.1.1"
      tag: "backend-v0.1.1"
      changed: false
      commits: []
```

Każdy kolejny release jest dopisywany na początku pliku. `releases.yaml`
powstaje automatycznie po pierwszym udanym workflow.

### Wymagane ustawienie GitHub

Workflow używa wbudowanego `GITHUB_TOKEN`, nie tokena zapisanego w repo.
W ustawieniach repozytorium sprawdź:

```text
Settings → Actions → General → Workflow permissions
→ Read and write permissions
```

Token służy wyłącznie do aktualizacji `package.json`, `releases.yaml` i taga
release. Nie wpisuj tokenów w pliki projektu ani w commity.

## Komendy deweloperskie

Frontend:

```bash
cd front
npm run dev                       # Vite dev server na porcie 4200
npm run start                     # alias dla npm run dev
npm run build                     # typecheck (tsc) + build produkcyjny
npm run lint                      # ESLint
npm run lint:fix                  # ESLint z automatycznymi poprawkami
npm run format                    # Prettier z zapisem zmian
npm run format:check              # sprawdzenie formatowania Prettier
npm run test                      # testy Vitest
npm run preview                   # podgląd builda produkcyjnego
```

Backend:

```bash
cd backend
npm run dev                       # Next.js w trybie developerskim
npm run build                     # build produkcyjny
npm start                         # uruchomienie builda produkcyjnego
npm run lint                      # ESLint
npm run lint:fix                  # ESLint z automatycznymi poprawkami
npm run format                    # Prettier z zapisem zmian
npm run format:check              # sprawdzenie formatowania Prettier
npm run db:migrate                # migracje bazy (migration/*.sql)
```

## Dalszy rozwój

1. Rozszerz REST API w `backend/src/app/api/`, dodając autoryzację, paginację
   oraz endpointy aktualizacji i usuwania projektów.
2. Dodaj osobny serwis Angulara do komunikacji z API i modele współdzielone
   między ekranami.
3. Dodaj testy jednostkowe i integracyjne dla endpointów oraz komponentów.
4. Rozszerz istniejący workflow GitHub Actions o testy i audyt zależności.

## Zasady utrzymania

README jest dokumentem roboczym projektu i należy go aktualizować razem z
każdą zmianą wpływającą na uruchamianie lub architekturę. W szczególności:

1. Po zmianie wersji Angulara, Next.js, Node.js lub bazy zaktualizuj sekcje
   „Aktualny stan" i „Wymagania".
2. Po dodaniu endpointu dopisz go do listy API oraz zaktualizuj przykładowe
   żądania i odpowiedzi.
3. Po zmianie zmiennych środowiskowych uzupełnij `.env.example` i tabelę
   konfiguracji.
4. Po zmianie zasad migracji opisz kolejność uruchamiania i wpływ na
   istniejące dane.
5. Po zmianie komend npm zaktualizuj sekcję „Komendy deweloperskie".
6. Artefakty builda frontu (`front/out-tsc/`) są ignorowane w Git i nie
   powinny być commitowane.

## Walidacja

Po instalacji zależności uruchom:

```bash
cd front && npm run lint && npm run format:check && npm run build
cd ../backend && npm run lint && npm run format:check && npm run build
```

Weryfikacja działania API:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/products
```

Ostatnia walidacja:

- `front`: lint, Prettier check i build - OK,
- `backend`: lint, Prettier check, TypeScript check i build - OK,
- `backend`: `npm run db:migrate` - wymaga bazy i może aplikować migracje,
- API: `GET /api/health` i `GET /api/products`.
