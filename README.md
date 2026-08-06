# OmniFrame 

Starter aplikacji złożony z frontendu Angular (Vite), backendu REST w Next.js
oraz bazy Postgres (Neon). Katalogi są niezależnymi aplikacjami, dlatego każdą
z nich uruchamiamy w osobnym terminalu.

Aktualny stan: frontend Angular 20 budowany Vite (`@analogjs/vite-plugin-angular`),
backend Next.js 16.3.0, baza Neon Postgres przez `@neondatabase/serverless`
(HTTPS/443, działa też w sieciach blokujących port 5432). Projekt jest
przygotowany jako baza do dalszej rozbudowy, nie jako gotowe wdrożenie
produkcyjne.

## Struktura

```text
OmniFrame/
├── front/       # Angular 20 + Vite, dashboard i routing
└── backend/     # Next.js 16 App Router, REST API + migracje SQL (Postgres)
```

Najważniejsze pliki:

```text
front/src/app/                 # layout, routing, dashboard i strona About
front/vite.config.ts           # Vite + plugin Angulara, proxy /api na dev
backend/src/app/api/health/    # kontrola API i połączenia z bazą
backend/src/app/api/products/  # odczyt i tworzenie projektów
backend/src/lib/db.ts          # klient Neon (DATABASE_URL)
backend/scripts/migrate.mjs    # runner migracji (tabela _migrations)
backend/migration/001_init.sql # tabela projects
backend/migration/002_seed.sql # dane przykładowe (idempotentne)
```

## Wymagania

- Node.js 20.19 lub nowszy
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

Runner `scripts/migrate.mjs` tworzy tabelę `_migrations` i aplikuje po kolei
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

| Zmienna | Znaczenie |
| --- | --- |
| `DATABASE_URL` | connection string Postgres/Neon (host pooler, `sslmode=require`) |

Endpointy:

- `GET /api/health` - sprawdza API i połączenie z bazą,
- `GET /api/products` - zwraca ostatnie projekty z bazy,
- `POST /api/products` - tworzy projekt.

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

W trybie dev Vite proxy przekazuje `/api/*` do
`https://apiomniframe.vercel.app`, a na Vercel działa rewrite `/api/*` -> backend.
Dzięki temu frontend nie woła cross-origin bezpośrednio i nie wpada w CORS.

## Routing frontendu

- `/` - dashboard z metrykami, wykresem, akcjami oraz tabelą projektów,
- `/products` - podstrona z listą produktów pobieraną z API,
- `/about` - opis warstw aplikacji.

Routing używa lazy-loaded standalone components. Dashboard pobiera dane z
`GET /api/products` (na bazowym URL z `VITE_API_BASE_URL`) i pokazuje komunikat,
gdy API jest niedostępne.

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
3. Jeśli oba buildy przejdą, pobiera ostatni tag `vX.Y.Z`.
4. Zbiera commity od tego taga do aktualnego pushu.
5. Wylicza nową wersję:

   | Commit | Zmiana wersji |
   | --- | --- |
   | `feat:` | minor, `0.1.0` → `0.2.0` |
   | pozostałe, np. `fix:`, `docs:` | patch, `0.1.0` → `0.1.1` |
   | `feat!:` lub `BREAKING CHANGE` | major, `0.1.0` → `1.0.0` |

6. Aktualizuje `front/package.json` i `front/package-lock.json`.
7. Generuje `releases.yaml` z wersją oraz nazwami commitów.
8. Tworzy commit release i tag, np. `v0.1.1`.
9. Wypycha commit i tag do `main`.

Commit wygenerowany automatycznie ma format:

```text
chore: release 0.1.1 [skip ci]
```

`[skip ci]` oraz użycie `GITHUB_TOKEN` zapobiegają uruchomieniu kolejnego
release dla automatycznego commita.

### Przykład `releases.yaml`

```yaml
releases:
  - version: "0.1.1"
    date: "2026-08-06T12:00:00.000Z"
    commit: "a1b2c3d4..."
    commits:
      - hash: "a1b2c3d4"
        author: "Filip"
        date: "2026-08-06T11:55:00.000Z"
        message: "fix: handle empty products response"
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
npm run build                     # typecheck (tsc) + build produkcyjny
npm run preview                   # podgląd builda produkcyjnego
```

Backend:

```bash
cd backend
npm run dev                       # Next.js w trybie developerskim
npm run build                     # build produkcyjny
npm start                         # uruchomienie builda produkcyjnego
npm run lint                      # ESLint
npm run db:migrate                # migracje bazy (migration/*.sql)
```

## Dalszy rozwój

1. Rozszerz REST API w `backend/src/app/api/`, dodając autoryzację, paginację
   oraz endpointy aktualizacji i usuwania projektów.
2. Dodaj osobny serwis Angulara do komunikacji z API i modele współdzielone
   między ekranami.
3. Dodaj testy jednostkowe i integracyjne dla endpointów oraz komponentów.
4. Rozszerz istniejący workflow GitHub Actions o lint, testy i audyt zależności.

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

## Walidacja

Po instalacji zależności uruchom:

```bash
cd front && npm run build
cd ../backend && npm run build
```

Weryfikacja działania API:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/products
```

Ostatnia walidacja tego startera:

- `front`: `npm run build` - OK,
- `backend`: `npm run build` - OK,
- `backend`: `npm run db:migrate` - OK (migracje idempotentne),
- `GET /api/health` i `GET /api/products` z bazą Neon - OK.
