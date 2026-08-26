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

## Format daty i godziny

Backend zwraca każdy timestamp w jednym formacie - ISO 8601 w UTC
(`2026-08-26T13:36:00.000Z`). Frontend ma **jeden** format wyświetlania, trzymany
w stałych w `src/app/core/date-time.ts`:

- `DATE_TIME_FORMAT = 'dd.MM.yyyy HH:mm'` - data z godziną,
- `DATE_FORMAT = 'dd.MM.yyyy'` - sama data,
- `EMPTY_DATE_PLACEHOLDER = '-'` - brak wartości.

**Zawsze używaj pipe'ów** z `src/app/core/date-time.pipe.ts`, nigdy nie renderuj
surowego stringa z API ani nie wywołuj `| date: '...'` z własnym wzorcem:

```html
<span>{{ user.lastLoginAt | appDateTime }}</span>
<span>{{ currentUser()?.birthDate | appDate }}</span>
```

W kodzie TypeScript (poza szablonem) korzystaj z `formatDateTime()`,
`formatDateOnly()` i `toLocalDayKey()` z tego samego modułu.

Pipe'y przeliczają czas na **strefę przeglądarki**, dlatego godzina jest ta sama
lokalnie i po wdrożeniu na Vercela (serwer chodzi w UTC). `appDate` traktuje
wartości typu `YYYY-MM-DD` (kolumny `DATE`, np. data urodzenia) jako datę
kalendarzową i nie przesuwa ich strefą.

## Routing

- `/` - dashboard,
- `/products` - lista produktów z API,
- `/about` - informacje o projekcie.

## Internacjonalizacja (i18n)

Aplikacja obsługuje dwa języki: **angielski (en)** i **polski (pl)**.

### Jak dodać nową tłumaczenie?

1. Edytuj pliki XLF w `src/i18n/`:
   - `messages.en.xlf` - tłumaczenia angielskie
   - `messages.pl.xlf` - tłumaczenia polskie

2. Dodaj nową `<trans-unit>` z unikalnym ID:

   ```xml
   <trans-unit id="my-key" datatype="html">
     <source>English text</source>
     <target>Polish translation</target>
   </trans-unit>
   ```

3. W szablonie HTML użyj `$localize`:

   ```html
   <p i18n="@@my-key">English text</p>
   ```

4. W TypeScript/komponencie użyj `LocalizationService`:
   ```typescript
   readonly localizationService = inject(LocalizationService);
   locale = this.localizationService.currentLocale(); // 'en' | 'pl'
   ```

### Switcher języków

Language switcher jest dostępny w topbarze. Zmiana języka jest przechowywana w pamięci sesji.

### Struktura

```
src/i18n/
  ├── messages.en.xlf    # Angielskie tłumaczenia
  └── messages.pl.xlf    # Polskie tłumaczenia

src/app/services/
  ├── localization.service.ts  # Serwis zarządzania językami
  └── theme.service.ts         # Serwis zarządzania dark mode

src/app/components/
  ├── language-switcher/
  │   ├── language-switcher.component.ts      # Logika switcher języków
  │   ├── language-switcher.component.html    # Szablon
  │   └── language-switcher.component.scss    # Style
  └── theme-switcher/
      ├── theme-switcher.component.ts         # Logika switcher trybu
      ├── theme-switcher.component.html       # Szablon
      └── theme-switcher.component.scss       # Style
```

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
