# Frontend (Angular 22 + Vite)

Frontend aplikacji OmniFrame. UI działa na Angular 22 (standalone components)
i Vite.

## Wymagania

- Node.js 22.22.3+
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
npm run start
npm run build
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
npm run preview
```

Ostatnia aktualizacja: 2026-08-16 21:38

## Google OAuth (frontend only)

Aplikacja ma logowanie przez Google bez backendu:

- `/login` - strona logowania z Google Identity Services,
- po poprawnym logowaniu użytkownik trafia na dashboard,
- dashboard wyświetla imię i nazwisko z konta Google,
- przycisk `Logout` wylogowuje i przenosi z powrotem na `/login`,
- sesja logowania wygasa automatycznie po 30 minutach,
- backend weryfikuje Google ID token i ustawia własne cookie sesji
  `HttpOnly`/`Secure`,
- lista użytkowników pokazuje też rolę `admin`, `user` albo `moderator`
  pobieraną z backendu.

Konfiguracja klienta OAuth:

```env
VITE_GOOGLE_CLIENT_ID=181921852616-kqff26dgukqpg5o46ulkik3ir2hcri4r.apps.googleusercontent.com
```
