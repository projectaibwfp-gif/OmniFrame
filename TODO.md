# TODO

## P0 — bezpieczeństwo

1. Przenieść API na first-party origin (`vercel.app` jest na Public Suffix
   List, więc cookie sesji są third-party z `SameSite=None` i mogą być
   blokowane przez Safari/ITP). Rewrite `/api/*` w `frontend/vercel.json`
   już kiedyś złamał logowanie (`frontend/README.md`); realna opcja to
   własna domena z subdomeną API, potem `SameSite=Lax`.
2. Dodać rate limiting dla `/api/auth/*` i endpointów wołających TibiaData
   (każdy `GET /api/character/:name` po TTL to zapis snapshotu w bazie).

## P1 — stabilność danych i API

3. Dodać FK do `users` i `CHECK` dla `target_kind`/`status` w
   `character_progress_entries`.
4. Dodać retry/backoff dla TibiaData i Neon.
5. Dodać request ID, metryki, alerty i monitoring crona.
6. Sprawdzać `/api/health` po deployu i cyklicznie (produkcja zwracała 500
   przez 12 dni bez alertu).
7. Zwracać błąd z `POST /api/cron/highscores`, gdy świat nie zebrał
   wszystkich vocation (dziś `success: true` przy 0/5).

## P1 — background job wyszukiwania postaci

8. Dodać tabelę `character_lookup_jobs`:
   `id`, `name`, `status`, `attempts`, `result`, `error`, `created_at`,
   `started_at`, `finished_at`.
9. Dodać `POST /api/character-lookups`, zwrot `202 Accepted` + `jobId`.
10. Dodać `GET /api/character-lookups/:jobId` ze statusami:
    `pending`, `processing`, `completed`, `failed`.
11. Dodać worker uruchamiany przez cron:
    pobranie jobów, lock, TibiaData/highscores, zapis wyniku.
12. Dodać timeout, retry, deduplikację aktywnych jobów i limit requestów.
13. Przełączyć frontend na submit joba + polling statusu.
14. Dodać testy endpointów, workera, retry, timeoutu i równoległego locka.

## P2 — frontend

15. Ukończyć i18n wszystkich ekranów, etykiet, aria-labeli i `html[lang]`;
    zdecydować `@angular/localize` (zainstalowany, nieużywany) vs własne
    `*.labels.ts`.
16. Wynieść `hunting-places.json` (1,2 MB, chunk 461 kB) z bundla do API
    albo leniwie ładowanego assetu.
17. Dodać centralny `ApiClient` i wspólną obsługę `ApiErrorResponseDto`.
18. Dodać testy komponentów i serwisów dla krytycznych ścieżek.

## P2 — utrzymanie

19. Dodać testy security i contract tests do CI.
20. Przenieść migracje do osobnego deploy joba, poza build Vercel
    (każdy build, także preview, migruje bazę z `DATABASE_URL`; runner
    nie ma locka).
21. Rozważyć współdzielony cache Redis przy skalowaniu wielu instancji.
