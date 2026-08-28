# AGENTS.md - backend (Next.js 16 App Router)

Zasady specyficzne dla `backend/`. Zasady globalne (Clean Code, quality gate,
kontrakty API, mapa dokumentacji) są w `AGENTS.md` w katalogu głównym repo.

Uzupełniająca dokumentacja: `backend/README.md` (konfiguracja, endpointy,
komendy), `backend/CRON.md` (cron highscores), `README.md` (całość projektu).

## Route Handlers

1. Pliki produkcyjne zawsze nazywaj `route.ts` - tak wymaga App Router.
2. `export const dynamic`, `maxDuration` i pozostałe segment configi muszą być
   **literałami**. Next.js analizuje je statycznie, więc
   `export const maxDuration = MAX_DURATION_SECONDS` wywala build z błędem
   "Invalid segment configuration export detected". To jedyny dopuszczalny
   wyjątek od zakazu magic numbers - opisz go komentarzem "dlaczego".
3. Handler zwraca `Promise<NextResponse>`; `NextRequest` importuj jako typ
   (`import { NextResponse, type NextRequest } from 'next/server';`).
4. Błędy zwracaj przez `errorResponse()` z `@/lib/api-response`, z kodem z
   `@/lib/errors` (`ErrorCode`). Nie konstruuj odpowiedzi błędu ręcznie.
5. Logowanie wyłącznie przez `@/lib/logger` (`logInfo`, `logWarn`, `logError`).
   Nie używaj `console.*` poza `logger.ts` i skryptami CLI.

## Testy API

6. Nazywaj pliki testów opisowo, nie generycznie `route.test.ts`. Preferuj nazwy
   zorientowane na endpoint: `health.get.test.ts`, `google.post.test.ts`,
   `users.api.test.ts`, `dashboard.get.test.ts` - raporty testów mają być
   czytelne bez otwierania drzewa plików.
7. Trzymaj testy obok route'a, który pokrywają, konsekwentnie z sufiksem `.test.ts`.
8. Każdy endpoint ma **minimum dwa** przypadki: happy path i ścieżkę błędu
   (walidacja, autoryzacja albo błąd zależności zewnętrznej).
9. Mockuj granice zewnętrzne - auth, bazę, cookies, serwisy third-party - i
   asertuj zarówno status HTTP, jak i payload JSON.
10. Gdy route obsługuje wiele metod, pokryj każdą osobno. Preferuj jedną skupioną
    asercję na scenariusz zamiast szerokich testów integracyjnych.

## SQL i baza (Neon)

11. **Nigdy nie wstawiaj fragmentów SQL ze zmiennych do tagged template**
    `sql\`...\``. W `@neondatabase/serverless` interpolowany string staje się
    **parametrem bindowanym**, a nie surowym SQL-em - to rozwala zapytanie.
    Listy kolumn i JOIN-y zostają wpisane literalnie w zapytaniu.
12. Wszystkie wartości od użytkownika przekazuj przez interpolację w tagged
    template (parametryzacja), nigdy przez konkatenację stringów.
13. Wyniki zapytań typuj jawnie, np. `(await sql\`...\`) as Array<{ name: string }>`,
żeby nie wyciekał `any`.
14. Mapowanie wiersza bazy -> DTO trzymaj w jednym miejscu
    (`src/lib/user-row.ts` dla `users`). `snake_case` kończy się na granicy SQL.
15. Przed odczytem `rows[0]` sprawdzaj długość tablicy.

## Czas i daty

15a. Kolumny czasowe to `TIMESTAMPTZ NOT NULL DEFAULT now()`. API zwraca je w
jednym formacie - ISO 8601 UTC (`2026-08-26T13:36:00.000Z`).

15b. Konwersję robi wyłącznie `toIsoUtc()` z `src/lib/date-time.ts`, wołane w
mapperze wiersza na DTO. Typ wiersza deklaruje kolumnę jako `SqlTimestamp`
(sterownik Neona zwraca `Date` albo tekst Postgresa).

15c. Nie formatuj czasu w SQL-u przez `to_char(...)`. Wzorca nie da się trzymać
w stałej i wstawić do tagged template (stałby się parametrem bindowanym), więc
`to_char` zawsze kończy się powtarzaniem formatu w każdym zapytaniu. Zapytania
selektują surową kolumnę: `created_at AS "createdAt"`.

15d. Kolumn typu `DATE` (np. `users.birth_date`) nie przepuszczaj przez
`toIsoUtc()` - to data kalendarzowa bez strefy, konwersja przesunęłaby ją o dobę.

15e. W fixture'ach testów podawaj timestampy tak, jak zwraca je Postgres
(`'2026-08-17 12:00:00+00'`), a asertuj kanoniczne ISO
(`'2026-08-17T12:00:00.000Z'`).

## Walidacja i stałe

16. Limity walidacji i dozwolone wartości enumów trzymaj w `src/lib/validation.ts`
    (`DESCRIPTION_MAX_LENGTH`, `USER_ROLES`, `PHONE_MIN_DIGITS`,
    `MIN_USER_AGE_YEARS`, ...). Nie powtarzaj
    liczb ani list wartości w route'ach i w `src/lib/openapi.ts`.
17. Flagi cookie (`isProd`, `cookieSameSite`, `cookieSecure`) pochodzą z
    `src/lib/cookie-config.ts` - nie deklaruj ich lokalnie.

## Migracje

18. Nazwy numerowane rosnąco: `003_opis.sql`, `004_opis.sql`, ...
19. Statementy kończą się średnikiem na końcu linii - plik jest dzielony na
    pojedyncze statementy, bo driver HTTP Neona wykonuje je pojedynczo.
20. Bez ciał funkcji PL/pgSQL `$$ ... $$` (zawierają średniki w środku).
21. Pisz idempotentnie (`IF NOT EXISTS`, guardy) - nie ma transakcji na cały plik.
22. Migracje nie uruchamiają się na buildzie Vercel. Przed wdrożeniem zmiany
    schematu odpal `npm run db:migrate` lokalnie przeciwko właściwej bazie.

## TibiaData i cache

23. Punktem odniesienia dla endpointów TibiaData jest lokalny snapshot
    `shared/api/swagger.json` (w tym `/v4/character/{name}`). Mapowanie DTO
    trzymaj zgodne z tym plikiem.
24. Backend utrzymuje 15-minutowy cache w pamięci dla stron highscores,
    boostable bosses, creatures i newsów. Cache highscores jest kluczowany per
    (world, vocation, page), żeby nie dublować wywołań API.
25. `GET /api/boostable-bosses` zwraca aktualnie boostowanego bossa i pełną listę
    (DTO `BoostableBossDto` / `BoostableBossesDto`).
26. `GET /api/creatures` zwraca boostowanego potwora i listę creature
    (DTO `TibiaCreatureDto` / `TibiaCreaturesDto`), mapowane z `/v4/creatures`.
27. `GET /api/character/:name` wzbogaca payload o dokładny EXP z highscores
    (`/v4/highscores/{world}/experience/{vocation}/{page}`, fallback do
    `experience/all` w trybie restrykcji) oraz o historię sprawdzeń z tabeli
    `character_lookups`.
28. `GET /api/news` zwraca newsy z `v4/news/latest` z 15-minutowym cache.

## Highscores snapshots i cron

29. Wszystkie postacie z highscores lądują w tabeli
    `character_highscores_snapshots` z bucketowaniem 15-minutowym (timestampy
    zaokrąglane do 10:00, 10:15, 10:30, 10:45...). Każda postać zapisywana jest
    maksymalnie raz na bucket.
30. `POST /api/cron/highscores` iteruje po światach (env `CRON_WORLDS`, domyślnie
    `Dia,Amera,Antica`) i wszystkich 4 vocation, pobiera wszystkie strony
    highscores i zapisuje do bazy. Zwraca statystyki (worlds/vocations processed,
    characters collected, duration). Uruchamiany co 12 godzin przez GitHub Actions
    lub Vercel Cron. Konfiguracja i testowanie: `backend/CRON.md`.
31. `GET /api/highscores-snapshots?page=1&pageSize=50&world=Dia&sortDir=desc`
    zwraca snapshoty z paginacją, sortowaniem po `level` i filtrem po świecie.

## Dokumentacja API

32. Backend wystawia specyfikację jako `GET /api/openapi` (JSON) i interaktywne
    Swagger UI pod `/swagger`. Po zmianie endpointu zaktualizuj
    `src/lib/openapi.ts` oraz listy endpointów w `README.md` i `backend/README.md`.

33. Wszystkie błędy HTTP mają kontrakt `{ "error": { "code": "string", "message": "string" } }`.
    Używaj `errorResponse()` i aktualizuj schemat `ErrorResponse` w OpenAPI.
34. `/api/users` obsługuje wyłącznie listę użytkowników. Pojedynczy rekord pobieraj
    przez `GET /api/users/:googleId`; nie używaj query parametru `google_id` do zmiany
    kształtu odpowiedzi.
35. Zmiany kontraktów wymagają aktualizacji `shared/api-contract.ts`, OpenAPI oraz
    testu w `src/lib/api-contract.test.ts`.

## Deployment

33. Zmienne środowiskowe ustawiaj w Vercel (`Settings > Environment Variables`):
    `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `TIBIA_DATA_API_BASE_URL`, `CRON_WORLDS`.
34. Dla crona co 12 godzin użyj Vercel Cron Functions - Vercel sam wykrywa
    route'y `api/cron/*`, nie trzeba dodatkowej konfiguracji.
