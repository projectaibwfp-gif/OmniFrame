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
npm install
npm run dev
```

Frontend będzie dostępny pod `http://localhost:4200`. Proxy Vite przekazuje
lokalne wywołania `/api/*` do backendu na porcie 3000, więc nie trzeba wpisywać
adresu backendu w kodzie UI.

## Routing frontendu

- `/` - dashboard z metrykami, wykresem, akcjami oraz tabelą projektów,
- `/about` - opis warstw aplikacji.

Routing używa lazy-loaded standalone components. Dashboard pobiera dane z
`GET /api/products` i pokazuje komunikat, gdy backend lub baza nie są dostępne.

## Wdrożenie (Vercel)

Repo jest wdrażane jako dwa projekty Vercel:

- **frontend**: Root Directory `front`, framework Vite; `front/vercel.json`
  ustawia build, output `dist`, rewrite `/api/*` na backend oraz nagłówki
  bezpieczeństwa (CSP, `X-Frame-Options` itd.),
- **backend**: Root Directory `backend`, framework Next.js; zmienna
  środowiskowa `DATABASE_URL` (Production + Preview).

Migracje nie uruchamiają się podczas builda Vercel. Przed wdrożeniem zmian
schematu uruchom `npm run db:migrate` lokalnie przeciwko bazie produkcyjnej.

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
4. Dodaj CI, które uruchamia build, lint, testy i audyt zależności.

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
