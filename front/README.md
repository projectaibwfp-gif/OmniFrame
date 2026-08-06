# Frontend (Angular + Vite)

Frontend aplikacji OmniFrame. UI działa na Angular 20 (standalone components) i Vite.

## Wymagania

- Node.js 20.19+
- npm 10+

## Konfiguracja

Skopiuj plik środowiskowy:

```bash
cp .env.example .env
```

Zmienne:

- `VITE_API_BASE_URL` - bazowy adres API używany przez frontend (domyślnie `/api`).

Przykład (`.env.example`):

```env
VITE_API_BASE_URL=/api
```

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Domyślnie frontend działa na `http://localhost:4200`.

## Integracja z API i CORS

Frontend wykonuje requesty na ścieżki `/api/*` (same-origin), np. `/api/products`.

- w **dev**: Vite proxy przekazuje `/api/*` do `https://apiomniframe.vercel.app`,
- na **Vercel**: rewrite w `vercel.json` przekazuje `/api/*` do `https://apiomniframe.vercel.app/api/:path*`.

Dzięki temu przeglądarka nie wykonuje bezpośrednich wywołań cross-origin i nie wpada w CORS.

## Routing

- `/` - dashboard,
- `/products` - lista produktów z API,
- `/about` - informacje o projekcie.

## Komendy

```bash
npm run dev
npm run build
npm run preview
```

Ostatnia aktualizacja: 2026-08-06 15:20
