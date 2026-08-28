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

- `GOOGLE_CLIENT_ID` - client ID Google OAuth do weryfikacji ID tokena (fallback: `VITE_GOOGLE_CLIENT_ID`, potem stała domyślna w `shared/runtime-config.ts`).
- `SESSION_JWT_SECRET` - sekret podpisu access-token cookie sesji (`omniframe.session`, TTL 15 min). Bez niego backend używa hardcodowanego sekretu deweloperskiego - **ustaw w produkcji**.
- `SESSION_REFRESH_SECRET` - sekret podpisu refresh-token cookie (`omniframe.refresh`, TTL 30 dni, sliding). Jak wyżej - **ustaw w produkcji**.
- `TIBIA_DATA_API_BASE_URL` - bazowy URL zewnętrznego API TibiaData (domyślnie `https://dev.tibiadata.com/v4`).
- `CRON_WORLDS` - światy skanowane przez `POST /api/cron/highscores`, oddzielone przecinkami (domyślnie `Dia,Amera,Antica`).
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
- `GET /api/dashboard` - metryki dashboardu (konta, logowania, rejestracje, polecenia),
- `GET /api/auth/state` - tworzy i zapisuje stan logowania Google,
- `POST /api/auth/google` - loguje przez Google, ustawia cookie sesji i refresh,
- `GET /api/auth/me` - zwraca aktualną sesję użytkownika,
- `PUT /api/auth/me/main-character` - łączy postać TibiaData z kontem jako główną,
- `DELETE /api/auth/me/main-character` - odpina główną postać od konta,
- `POST /api/auth/refresh` - odnawia sesję z refresh cookie,
- `POST /api/auth/logout` - czyści cookie sesji,
- `GET /api/boostable-bosses` - aktualnie boostowany boss + pełna lista bossów,
- `GET /api/creatures` - aktualnie boostowany potwór + pełna lista creature,
- `GET /api/character/:name` - dane postaci TibiaData, dokładny EXP z highscores i historia sprawdzeń,
- `GET /api/killstatistics/:world` - statystyki zabójstw TibiaData dla świata,
- `GET /api/highscores-snapshots` - snapshoty highscores z paginacją, sortowaniem i filtrem po świecie,
- `POST /api/cron/highscores` - pobiera i zapisuje highscores wszystkich skonfigurowanych światów i vocation,
- `GET /api/news` - najnowsze newsy z TibiaData (cache 15 min),
- `POST /api/referrals/capture` - odkłada pierwszy referral do cookie,
- `GET /api/users` - lista użytkowników lub jeden po `google_id`,
- `POST /api/users` - ręczny upsert użytkownika Google.

Pełny opis payloadów i scenariuszy: `GET /api/openapi` (Swagger UI pod `/swagger`).

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
