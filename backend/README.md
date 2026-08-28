# Backend (Next.js API)

Backend REST dla OmniFrame oparty o Next.js (App Router) i Neon Postgres.
Kod aplikacji oraz runner migracji `scripts/migrate.ts` używają TypeScript.

## Wymagania

- Node.js 22.22.3+
- npm 10+
- baza Postgres (Neon lub kompatybilna) z connection stringiem

## Konfiguracja

Skopiuj konfigurację środowiska:

```bash
cp .env.example .env
```

Wymagana zmienna:

- `DATABASE_URL` - connection string do Postgresa (`sslmode=require`).

Opcjonalne zmienne:

- `CHARACTER_SNAPSHOT_TTL_MINUTES` - TTL cache'u profilu postaci pobieranego z bazy (domyślnie `15`). Jeśli w tabeli `character_lookups` mamy snapshot młodszy niż TTL, endpoint `GET /api/character/:name` zwraca go bez odpytywania TibiaData. Ustaw `0`, aby zawsze pobierać dane na żywo.

## Uruchomienie lokalne

```bash
npm install
npm run db:migrate
npm run dev
```

Domyślnie API działa na `http://localhost:3000`.

Swagger UI jest dostępny pod `http://localhost:3000/swagger`, a specyfikacja OpenAPI pod `http://localhost:3000/api/openapi`.

## Endpointy

- `GET /api/health` - status API + połączenie z bazą,
- `GET /api/openapi` - specyfikacja OpenAPI (JSON),
- `GET /api/users` - lista użytkowników,
- `GET /api/users/:googleId` - pojedynczy użytkownik po Google ID,

## Kontrakt błędów

Każdy endpoint zwraca błędy w jednym formacie:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request body is invalid"
  }
}
```

Błędy generuje `errorResponse()` z `src/lib/api-response.ts`. Schemat
`ErrorResponse` w `src/lib/openapi.ts` musi pozostać zgodny z runtime.

## Format czasu

W całym systemie obowiązuje **jeden** format czasu:

- w bazie: kolumny `TIMESTAMPTZ NOT NULL DEFAULT now()` (czyli instant z offsetem).
  Wyjątkiem jest `users.birth_date` - to `DATE`, data kalendarzowa bez strefy;
- w odpowiedziach API: ISO 8601 w UTC (`2026-08-26T13:36:00.000Z`).

Konwersję robi **wyłącznie** `toIsoUtc()` z `src/lib/date-time.ts` - używaj go w
każdym mapperze wiersza bazy na DTO (`user-row.ts`, `users.ts`,
`dashboard.ts`, `highscores-snapshots.ts`, `character-lookups.ts`). Nie formatuj
czasu w SQL-u przez `to_char(...)`: format musiałby być wpisany literalnie w
każdym zapytaniu, bo string interpolowany do tagged template Neona staje się
parametrem bindowanym. Zapytania zwracają surową kolumnę
(`created_at AS "createdAt"`), a typ wiersza deklaruje ją jako `SqlTimestamp`.

Kolumn `DATE` nie przepuszczaj przez `toIsoUtc()` - konwersja strefy przesunęłaby
datę o dobę.

## Komendy

```bash
npm run dev
npm run build
npm start
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run db:migrate
```

`npm run db:migrate` wymaga `DATABASE_URL` i może aplikować nowe migracje.
