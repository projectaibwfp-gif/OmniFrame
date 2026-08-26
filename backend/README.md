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
- `GET /api/products` - lista produktów (`id`, `name`, `status`, `category`, `updatedAt`),
- `POST /api/products` - tworzenie rekordu.

Przykład payloadu:

```json
{
  "name": "Nowy produkt",
  "category": "Operations",
  "status": "draft"
}
```

Walidacja:

- `name` jest wymagane, max 120 znaków,
- `status` dozwolone: `active` lub `draft`,
- `category` domyślnie: `General`.

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
