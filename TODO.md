# TODO

## P0 — bezpieczeństwo

- [x] Zablokować `POST /api/users` dla nie-adminów (albo usunąć endpoint):
      dziś każdy zalogowany może nadać dowolnemu kontu, także swojemu,
      rolę `admin` i nadpisać email/imię/zdjęcie innego usera
      (`googleId` wszystkich kont zwraca `GET /api/users`).
- [x] Dodać `requireAdmin()` i ograniczyć `/api/users` oraz `/api/dashboard`.
- [x] Zabezpieczyć `POST /api/cron/highscores` przez `CRON_AUTH_TOKEN`
      (i wysyłać token z `.github/workflows/cron-highscores.yml`).
- [x] Usunąć domyślne sekrety JWT; brak sekretu w produkcji ma blokować start.
- [x] Naprawić OAuth upsert, aby logowanie nie resetowało `role`.
- [ ] Przenieść API na first-party origin (`vercel.app` jest na Public Suffix
      List, więc cookie sesji są third-party z `SameSite=None` i mogą być
      blokowane przez Safari/ITP). Rewrite `/api/*` w `frontend/vercel.json`
      już kiedyś złamał logowanie (`frontend/README.md`); realna opcja to
      własna domena z subdomeną API, potem `SameSite=Lax`.
- [x] Dodać ochronę CSRF dla logout i pozostałych mutacji (sprawdzanie
      `Origin` w `backend/src/middleware.ts`).
- [x] Umożliwić unieważnienie sesji: refresh token żyje 30 dni i nie da się
      go odwołać (logout, zmiana roli, usunięcie konta); np.
      `users.session_version` w JWT albo rotowane refresh tokeny w bazie.
      `loadCurrentUser()` nie powinien zwracać syntetycznego usera, gdy
      rekordu w `users` nie ma.
- [x] Nie zwracać klientowi `error.message` z wyjątków
      (`POST /api/auth/google`: szczegóły `jose` przy 401 i błędy bazy przy 500).
- [ ] Dodać rate limiting dla `/api/auth/*` i endpointów wołających TibiaData
      (każdy `GET /api/character/:name` po TTL to zapis snapshotu w bazie).
- [x] Usunąć PII z logów: email w `auth.login`, telefon w
      `auth.profile.update`.

## P1 — stabilność danych i API

- [x] Dodać walidację requestów przez wspólny schemat runtime.
- [x] Objąć schematem runtime także `PATCH /api/auth/me` i `POST /api/users`
      (dziś `as` na body; np. `phone: 123` kończy się `TypeError` i 500).
- [ ] Dodać constraint unikalności snapshotów (np. `normalized_name`, `world`,
      `exact_experience`); tabela bucketów zniknęła w `016`, a deduplikacja
      to SELECT + INSERT w kodzie, podatny na wyścig.
- [ ] Zmienić `TIMESTAMP` na `TIMESTAMPTZ` w snapshotach.
- [x] Zastąpić N+1 w snapshotach operacjami batch.
- [x] Rozbić cron na mniejsze porcje (np. świat na wywołanie): pętla
      świat × profesja jest sekwencyjna przy `maxDuration = 300` s.
- [ ] Dodać distributed lock i idempotencję crona.
- [x] Przyspieszyć `listHighscoresSnapshots()`: `DISTINCT ON` po całej
      tabeli i `COUNT(DISTINCT ...)` przy każdym requeście; tabela
      „latest per character” albo indeks pod filtr po świecie.
- [x] Dodać retencję dla `character_highscores_snapshots` i
      `character_lookups` (dziś rosną bez limitu).
- [ ] Poprawić kontrakt `HighscoresSnapshotRecordDto.id`: w DTO `number`,
      w bazie `UUID`.
- [ ] Dodać FK do `users` i `CHECK` dla `target_kind`/`status` w
      `character_progress_entries`.
- [x] Weryfikować Google ID token raz (dziś w route i ponownie w
      `issueSessionCookie()`).
- [ ] Potwierdzić domyślny `TIBIA_DATA_API_BASE_URL` (`dev.tibiadata.com`)
      zamiast stabilnego `api.tibiadata.com`.
- [ ] Dodać retry/backoff dla TibiaData i Neon.
- [ ] Dodać request ID, metryki, alerty i monitoring crona.

## P1 — background job wyszukiwania postaci

- [ ] Dodać tabelę `character_lookup_jobs`:
      `id`, `name`, `status`, `attempts`, `result`, `error`, `created_at`,
      `started_at`, `finished_at`.
- [ ] Dodać `POST /api/character-lookups`, zwrot `202 Accepted` + `jobId`.
- [ ] Dodać `GET /api/character-lookups/:jobId` ze statusami:
      `pending`, `processing`, `completed`, `failed`.
- [ ] Dodać worker uruchamiany przez cron:
      pobranie jobów, lock, TibiaData/highscores, zapis wyniku.
- [ ] Dodać timeout, retry, deduplikację aktywnych jobów i limit requestów.
- [ ] Przełączyć frontend na submit joba + polling statusu.
- [ ] Dodać testy endpointów, workera, retry, timeoutu i równoległego locka.

## P2 — frontend

- [x] Uzupełnić CSP w `frontend/vercel.json`: `frame-src` bez
      `tibiamaps.io` (iframe mapy w charm places) i `img-src` bez
      `tibiamaps.github.io` (kafelki minimapy) - na produkcji są blokowane.
- [ ] Ukończyć i18n wszystkich ekranów, etykiet, aria-labeli i `html[lang]`;
      zdecydować `@angular/localize` (zainstalowany, nieużywany) vs własne
      `*.labels.ts`.
- [ ] Wynieść `hunting-places.json` (1,2 MB, chunk 461 kB) z bundla do API
      albo leniwie ładowanego assetu.
- [ ] Dodać centralny `ApiClient` i wspólną obsługę `ApiErrorResponseDto`.
- [x] Ograniczyć `subscribe()` w komponentach na rzecz `toSignal()`/
      `takeUntilDestroyed()`.
- [x] Dodać globalny handler błędów HTTP oraz spójne stany loading/error/empty.
- [ ] Dodać testy komponentów i serwisów dla krytycznych ścieżek.

## P2 — utrzymanie

- [x] Naprawić CI w `release.yml`: uruchamia `npm run format` zamiast
      `format:check` i nie uruchamia testów; dodać workflow na pull requesty
      z pełnym quality gate.
- [ ] Dodać testy security i contract tests do CI.
- [ ] Dodać dependency/security audit (`npm audit`, Dependabot/Renovate).
- [ ] Przenieść migracje do osobnego deploy joba, poza build Vercel
      (każdy build, także preview, migruje bazę z `DATABASE_URL`; runner
      nie ma locka).
- [ ] Rozważyć współdzielony cache Redis przy skalowaniu wielu instancji.
- [ ] Zmigrować deprecated Next.js `middleware` do `proxy`.
- [x] Zsynchronizować README z rzeczywistością: cron działa co 4 h (nie
      12 h), a frontend woła backend cross-origin (nie przez rewrite
      `/api/*`).
