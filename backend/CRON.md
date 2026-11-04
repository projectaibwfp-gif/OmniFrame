# Cron Highscores Collection

Automatyczne pobieranie i zapisywanie danych postaci z Tibia highscores.

## Konfiguracja

### Zmienne środowiskowe (`.env`)

```
# Lista światów do skanowania (opcjonalne, domyślnie: Dia,Amera,Antica)
CRON_WORLDS=Dia,Amera,Antica
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
{ "data": { "worlds": ["Dia", "Amera", "Antica"] } }
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

**Co 4 godziny (GitHub Actions)**, plik `.github/workflows/cron-highscores.yml`.
Workflow pobiera listę światów z `GET /api/cron/highscores`, a potem wywołuje
`POST /api/cron/highscores?world=<świat>` osobno dla każdego świata, więc każdy
świat ma własny limit `maxDuration` (5 minut). Błąd jednego świata nie przerywa
pozostałych, ale oznacza run jako nieudany. Workflow można też uruchomić ręcznie
(`workflow_dispatch`).

Sekrety do ustawienia w GitHub (Settings → Secrets and variables → Actions):

- `BACKEND_URL` - np. `https://apiomniframe.vercel.app`,
- `CRON_AUTH_TOKEN` - ta sama wartość co `CRON_AUTH_TOKEN` w Vercelu.

## Dane w bazie

- **`character_highscores_snapshots`** - historia: nowy wiersz tylko wtedy, gdy
  EXP postaci zmienił się od ostatniego zapisu.
  - Kolumny: `id`, `character_name`, `normalized_name`, `world`, `vocation`, `level`, `rank`, `exact_experience`, `checked_at`
- **`character_highscores_latest`** - ostatni wpis per postać i świat
  (klucz `(normalized_name, world)`). Służy do deduplikacji przy zapisie oraz do
  paginacji `GET /api/highscores-snapshots`.

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
-- Ile snapshotów zapisano w ostatnich 4 godzinach
SELECT COUNT(*) FROM character_highscores_snapshots
WHERE checked_at > (NOW() AT TIME ZONE 'UTC') - INTERVAL '4 hours';

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

Guard w workflow: brakuje sekretu `BACKEND_URL` albo `CRON_AUTH_TOKEN`. Prawdziwe
wywołanie trwa tyle, ile zbieranie świata (do 5 minut).
