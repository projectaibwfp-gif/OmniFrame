# Cron Highscores Collection

Automatyczne pobieranie i zapisywanie danych postaci z Tibia highscores.

## Konfiguracja

### Zmienne środowiskowe (`.env`)

```
# Lista światów do skanowania (opcjonalne, domyślnie: Dia,Antica)
CRON_WORLDS=Dia,Antica
# Token wymagany w nagłówku Authorization: Bearer <token> (bez niego każde wywołanie dostaje 401)
CRON_AUTH_TOKEN=change-me-cron-token
# Retencja historii w dniach (opcjonalne)
HIGHSCORES_SNAPSHOT_RETENTION_DAYS=365
CHARACTER_LOOKUP_RETENTION_DAYS=90
```

## Użycie

### Lista światów

```bash
curl -H "Authorization: Bearer $CRON_AUTH_TOKEN" https://yourdomain/api/cron/highscores
```

```json
{ "data": { "worlds": ["Dia", "Antica"] } }
```

### Zbieranie jednego świata

```bash
curl -X POST -H "Authorization: Bearer $CRON_AUTH_TOKEN" \
  "https://yourdomain/api/cron/highscores?world=Dia"
```

Bez parametru `world` endpoint przetwarza wszystkie światy z `CRON_WORLDS`
w jednym wywołaniu. Świat spoza `CRON_WORLDS` daje `400`.

### Odpowiedź (success)

```json
{
  "success": true,
  "stats": {
    "worldsProcessed": 1,
    "vocationsProcessed": 5,
    "charactersCollected": 5000,
    "duration": 45000
  }
}
```

## Harmonogram

**Raz dziennie o 13:00 UTC, czyli 14:00 CET / 15:00 CEST (GitHub Actions)**, plik `.github/workflows/cron-highscores.yml`.
Workflow pobiera listę światów z `GET /api/cron/highscores`, a potem wywołuje
`POST /api/cron/highscores?world=<świat>` osobno dla każdego świata, więc każdy
świat ma własny limit `maxDuration` (5 minut). Błąd jednego świata nie przerywa
pozostałych, ale oznacza run jako nieudany. Workflow można też uruchomić ręcznie
(`workflow_dispatch`).

Sekrety do ustawienia w GitHub (Settings → Secrets and variables → Actions):

- `BACKEND_URL` - np. `https://apiomniframe.vercel.app`,
- `CRON_AUTH_TOKEN` - ta sama wartość co `CRON_AUTH_TOKEN` w Vercelu.

Workflow `Build and release` wywołuje ten sam workflow w trybie `check-only`
(job `cron-check`): sprawdza sekrety i `GET /api/cron/highscores`, bez
zbierania danych. Release nie startuje, dopóki cron nie jest poprawnie
skonfigurowany.

## Dane w bazie

- **`character_highscores_snapshots`** - historia: nowy wiersz tylko wtedy, gdy
  EXP postaci zmienił się od ostatniego zapisu.
  - Kolumny: `id`, `character_name`, `normalized_name`, `world`, `vocation`, `level`, `rank`, `exact_experience`, `checked_at`
- **`character_highscores_latest`** - ostatni wpis per postać i świat
  (klucz `(normalized_name, world)`). Służy do deduplikacji przy zapisie oraz do
  paginacji `GET /api/highscores-snapshots`.

Unikalny indeks `(normalized_name, world, exact_experience)` chroni przed
duplikatami przy równoległych runach; workflow ma też `concurrency`, więc
run ręczny i z harmonogramu nie idą jednocześnie.

Zapis jednej vocation to jedno zapytanie SQL (`unnest` całej paczki), które
dopisuje zmienione snapshoty i aktualizuje `character_highscores_latest`.

### Retencja

Po każdym wywołaniu `POST` cron usuwa:

- snapshoty starsze niż `HIGHSCORES_SNAPSHOT_RETENTION_DAYS` (poza ostatnim
  snapshotem postaci, wskazywanym przez `character_highscores_latest`),
- wpisy `character_lookups` starsze niż `CHARACTER_LOOKUP_RETENTION_DAYS`.

## Monitoring

Logi backendu mają scope `cron.*` (`cron.start`, `cron.vocation`, `cron.prune`,
`cron.complete`, `cron.auth`).

```sql
-- Ile snapshotów zapisano w ostatniej dobie
SELECT COUNT(*) FROM character_highscores_snapshots
WHERE checked_at > now() - INTERVAL '24 hours';

-- Top 10 postaci po levelu na Dia
SELECT character_name, vocation, rank, level, exact_experience, checked_at
FROM character_highscores_latest
WHERE world = 'Dia'
ORDER BY level DESC
LIMIT 10;

-- Historia jednej postaci
SELECT * FROM character_highscores_snapshots
WHERE normalized_name = 'barteeek'
ORDER BY checked_at DESC;
```

## Testowanie lokalnie

```bash
# Uruchom backend (CRON_AUTH_TOKEN ustawiony w backend/.env)
cd backend
npm run dev

# W innym terminalu
curl -X POST -H "Authorization: Bearer $CRON_AUTH_TOKEN" \
  "http://localhost:3000/api/cron/highscores?world=Dia"
```

## Troubleshooting

### `401` z crona

`CRON_AUTH_TOKEN` nie jest ustawiony w backendzie albo sekret w GitHub ma inną
wartość niż zmienna w Vercelu.

### Timeout

- Każdy świat ma osobny limit 5 minut.
- Jeśli pojedynczy świat nie mieści się w limicie, sprawdź czas odpowiedzi
  TibiaData w logach `cron.vocation`.

### Dane nie są zapisywane

- Sprawdź, czy migracje się wykonały: tabele `character_highscores_snapshots`
  i `character_highscores_latest` powinny istnieć.
- Sprawdzaj logi: `scope: "highscores.saveSnapshots"` i `scope: "cron.vocation"`.

### GitHub Actions run failuje w kilka sekund

Krok `Verify cron secrets`: brakuje sekretu `BACKEND_URL` albo `CRON_AUTH_TOKEN`
(nazwa brakującego sekretu jest w logu). Krok `Fetch configured worlds` z `401`:
sekret w GitHub ma inną wartość niż `CRON_AUTH_TOKEN` w Vercelu. Prawdziwe
wywołanie trwa tyle, ile zbieranie świata (do 5 minut).
