# Backend (Next.js API)

Backend REST dla OmniFrame oparty o Next.js (App Router) i Neon Postgres.

## Wymagania

- Node.js 20.19+
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

## Endpointy

- `GET /api/health` - status API + połączenie z bazą,
- `GET /api/products` - lista projektów/produktów (`id`, `name`, `status`, `category`, `updatedAt`),
- `POST /api/products` - tworzenie rekordu.

Przykład payloadu:

```json
{
  "name": "Nowy projekt",
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
npm run db:migrate
```
