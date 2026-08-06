# Project AI

Starter aplikacji złożony z frontendu Angular, backendu REST w Next.js oraz bazy
MySQL. Katalogi są niezależnymi aplikacjami, dlatego każdą z nich uruchamiamy
w osobnym terminalu.

Aktualny stan: frontend działa na Angularze 20, backend na Next.js 16.3.0,
a połączenie z bazą obsługuje `mysql2`. Projekt jest przygotowany jako baza do
dalszej rozbudowy, nie jako gotowe wdrożenie produkcyjne.

## Struktura

```text
project_ai/
├── front/       # Angular 20, dashboard i routing
├── backend/     # Next.js 16 App Router, REST API
└── mysql/       # Docker Compose oraz skrypty inicjalizujące bazę
```

Najważniejsze pliki:

```text
front/src/app/                 # layout, routing, dashboard i strona About
front/proxy.conf.json          # lokalne przekierowanie /api do backendu
backend/src/app/api/health/    # kontrola API i połączenia z MySQL
backend/src/app/api/products/  # odczyt i tworzenie projektów
backend/src/lib/db.ts          # pula połączeń MySQL
mysql/01-create-database.sql   # baza i użytkownik
mysql/02-schema.sql            # tabela projects
mysql/03-seed.sql              # dane przykładowe
```

## Wymagania

- Node.js 20.19 lub nowszy
- npm 10+
- Docker Desktop z obsługą Compose (najprostszy sposób uruchomienia MySQL)

## Rejestr npm

Projekt korzysta wyłącznie z publicznego rejestru npm:

- `front/.npmrc` - `https://registry.npmjs.org/`,
- `backend/.npmrc` - `https://registry.npmjs.org/`.

Pliki `.npmrc` są lokalne dla projektu i nie zmieniają globalnej konfiguracji
npm ani nie korzystają z prywatnego rejestru Comarch. Po zmianie zależności
uruchamiaj `npm install` w odpowiednim katalogu, a następnie zatwierdzaj
zaktualizowany `package-lock.json`.

## Uruchomienie krok po kroku

### 1. Uruchom MySQL

W katalogu głównym projektu:

```bash
cd mysql
docker compose up -d
```

Kontener przy pierwszym uruchomieniu wykona automatycznie:

1. `01-create-database.sql` - bazę `project_ai` i użytkownika aplikacji,
2. `02-schema.sql` - tabelę `projects`,
3. `03-seed.sql` - przykładowe rekordy.

Skrypty inicjalizacyjne MySQL są wykonywane tylko przy pustym wolumenie. Aby
uruchomić je ponownie od zera, użyj `docker compose down -v` (usuwa lokalne dane
bazy).

### 2. Uruchom backend

W drugim terminalu:

```bash
cd backend
copy .env.example .env.local       # Windows, tylko jeśli pliku jeszcze nie ma
# cp .env.example .env.local       # macOS/Linux, tylko jeśli pliku jeszcze nie ma
npm install
npm run dev
```

Backend będzie dostępny pod `http://localhost:3000`.

W repozytorium lokalnie skonfigurowano `backend/.env.local` pod przekazane dane
bazy. Ten plik jest ignorowany przez Git i nie należy wpisywać jego zawartości
do README, commitów ani logów. Podany host został ustawiony jako
`127.0.0.1`; jeżeli baza działa na hostingu, zmień tylko `MYSQL_HOST` na adres
serwera.

Konfiguracja jest w `backend/.env.local`, utworzonym na podstawie
`backend/.env.example`:

| Zmienna | Domyślna wartość | Znaczenie |
| --- | --- | --- |
| `MYSQL_HOST` | `127.0.0.1` | host MySQL |
| `MYSQL_PORT` | `3306` | port MySQL |
| `MYSQL_USER` | `project_user` | użytkownik aplikacji |
| `MYSQL_PASSWORD` | `project_password` | hasło lokalne |
| `MYSQL_DATABASE` | `project_ai` | nazwa bazy |
| `MYSQL_CONNECTION_LIMIT` | `10` | limit połączeń w puli |

Przykładowe hasła są wyłącznie do środowiska lokalnego. Nie commituj
`.env.local` ani prawdziwych sekretów.

Endpointy:

- `GET /api/health` - sprawdza API i połączenie z MySQL,
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

Przykładowe żądanie:

```bash
curl -X POST http://localhost:3000/api/products ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Nowy projekt\",\"category\":\"Operations\",\"status\":\"draft\"}"
```

### 3. Uruchom frontend

W trzecim terminalu:

```bash
cd front
npm install
npm start
```

Frontend będzie dostępny pod `http://localhost:4200`. Angularowy proxy przekazuje
lokalne wywołania `/api/*` do backendu na porcie 3000, więc nie trzeba wpisywać
adresu backendu w kodzie UI.

## Routing frontendu

- `/` - dashboard z metrykami, wykresem, akcjami oraz tabelą projektów,
- `/about` - opis warstw aplikacji.

Routing używa lazy-loaded standalone components. Dashboard pobiera dane z
`GET /api/products` i pokazuje komunikat, gdy backend lub baza nie są dostępne.

## Komendy deweloperskie

Frontend:

```bash
cd front
npm start                         # serwer Angulara na porcie 4200
npm run build                     # build produkcyjny
npm run watch                     # build w trybie obserwowania
npm test                          # testy Angulara, gdy zostaną dodane
```

Backend:

```bash
cd backend
npm run dev                       # Next.js w trybie developerskim
npm run build                     # build produkcyjny
npm start                         # uruchomienie builda produkcyjnego
npm run lint                      # ESLint
```

## Dalszy rozwój

1. Dodaj modele i kolejne migracje SQL w `mysql/`; przy zmianach produkcyjnych
   użyj narzędzia migracyjnego zamiast ręcznego uruchamiania skryptów.
2. Rozszerz REST API w `backend/src/app/api/`, dodając autoryzację, paginację
   oraz endpointy aktualizacji i usuwania projektów.
3. Dodaj osobny serwis Angulara do komunikacji z API i modele współdzielone
   między ekranami.
4. Przenieś adresy API oraz feature flags do środowisk Angulara.
5. Dodaj testy jednostkowe i integracyjne dla endpointów oraz komponentów.
6. Zastąp przykładowe hasła z `.env.example` sekretami dostarczanymi przez
   menedżer sekretów w środowisku wdrożeniowym.
7. Dodaj CI, które uruchamia build, lint, testy i audyt zależności.

## Zasady utrzymania

README jest dokumentem roboczym projektu i należy go aktualizować razem z
każdą zmianą wpływającą na uruchamianie lub architekturę. W szczególności:

1. Po zmianie wersji Angulara, Next.js, Node.js lub MySQL zaktualizuj sekcje
   „Aktualny stan” i „Wymagania”.
2. Po dodaniu endpointu dopisz go do tabeli API oraz zaktualizuj przykładowe
   żądania i odpowiedzi.
3. Po zmianie zmiennych środowiskowych uzupełnij `.env.example` i tabelę
   konfiguracji.
4. Po zmianie skryptów SQL opisz kolejność uruchamiania i wpływ na istniejące
   dane.
5. Po zmianie komend npm zaktualizuj sekcję „Komendy deweloperskie”.
6. Przed zakończeniem zadania uruchom walidację z poniższej sekcji i wpisz
   istotne ograniczenia lub znane problemy.

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
- `backend`: `npm run lint` - OK,
- `backend`: `npm audit --omit=dev` - 0 podatności,
- `front`: `npm audit` zgłasza 8 podatności w zależnościach narzędziowych,
  w tym problemy bez dostępnej poprawki w części zależności Angulara.

Pełna weryfikacja endpointów wymaga uruchomionego Dockera, MySQL i backendu.
# OmniFrame
