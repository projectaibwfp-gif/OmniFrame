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

Frontend wywołuje backend cross-origin pod adresem z `VITE_API_BASE_URL`.

- w **dev**: domyślnie `/api` — Vite proxy przekazuje `/api/*` do
  `https://apiomniframe.vercel.app` (same-origin dla przeglądarki),
- w **produkcji** (build): domyślnie `https://apiomniframe.vercel.app/api` —
  aplikacja wywołuje backend bezpośrednio z `withCredentials`, a backend zwraca
  nagłówki CORS (`Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`)
  z `middleware.ts`. Zmienną `VITE_API_BASE_URL` ustawiaj tylko, gdy backend jest
 gdzie indziej.

Cookie sesji są `HttpOnly`, `SameSite=None; Secure` w produkcji, więc przeglądarka
przesyła je przy wywołaniach cross-origin z credentialed request.

> Uwaga: nie używaj `vercel.json` rewrite `/api -> apiomniframe` — Vercel nie
> przekazuje wiarygodnie `Set-Cookie` z external rewrite, co łamie logowanie
> (błąd `Invalid login state`).

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
- sesja logowania wygasa automatycznie po ~30 minutach nieaktywności
  (sliding: aktywność przedłuża sesję; brak wywołań API przez 30 min wylogowuje),
- backend weryfikuje Google ID token i ustawia własne cookie sesji
  `HttpOnly`/`Secure`,
- lista użytkowników pokazuje też rolę `admin`, `user` albo `moderator`
  pobieraną z backendu.

Konfiguracja klienta OAuth:

```env
VITE_GOOGLE_CLIENT_ID=181921852616-kqff26dgukqpg5o46ulkik3ir2hcri4r.apps.googleusercontent.com
```
