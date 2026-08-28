# TODO

## P0 — bezpieczeństwo

- [ ] Dodać `requireAdmin()` i ograniczyć `/api/users` oraz `/api/dashboard`.
- [ ] Zabezpieczyć `POST /api/cron/highscores` przez `CRON_AUTH_TOKEN`.
- [ ] Usunąć domyślne sekrety JWT; brak sekretu w produkcji ma blokować start.
- [ ] Naprawić OAuth upsert, aby logowanie nie resetowało `role`.
- [ ] Dodać ochronę CSRF dla logout i pozostałych mutacji.

## P1 — stabilność danych i API

- [ ] Dodać walidację requestów przez wspólny schemat runtime.
- [ ] Dodać constraint unikalności snapshotów per postać/świat/bucket.
- [ ] Zmienić `TIMESTAMP` na `TIMESTAMPTZ` w snapshotach.
- [ ] Zastąpić N+1 w snapshotach operacjami batch.
- [ ] Dodać distributed lock i idempotencję crona.
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

- [ ] Ukończyć i18n wszystkich ekranów, etykiet, aria-labeli i `html[lang]`.
- [ ] Dodać centralny `ApiClient` i wspólną obsługę `ApiErrorResponseDto`.
- [x] Ograniczyć `subscribe()` w komponentach na rzecz `toSignal()`/
      `takeUntilDestroyed()`.
- [ ] Dodać globalny handler błędów HTTP oraz spójne stany loading/error/empty.
- [ ] Dodać testy komponentów i serwisów dla krytycznych ścieżek.

## P2 — utrzymanie

- [ ] Dodać testy security i contract tests do CI.
- [ ] Dodać dependency/security audit (`npm audit`, Dependabot/Renovate).
- [ ] Przenieść migracje do osobnego deploy joba, poza build Vercel.
- [ ] Rozważyć współdzielony cache Redis przy skalowaniu wielu instancji.
- [ ] Zmigrować deprecated Next.js `middleware` do `proxy`.
