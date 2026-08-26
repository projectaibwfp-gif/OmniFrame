# Cron Highscores Collection

Automatyczne pobieranie i zapisywanie danych postaci z Tibia highscores.

## Konfiguracja

### Zmienne środowiskowe (`.env`)

```
# Lista światów do skanowania (opcjonalne, domyślnie: Dia,Amera,Antica)
CRON_WORLDS=Dia,Amera,Antica
```

## Użycie

### POST Request

```bash
curl -X POST https://yourdomain/api/cron/highscores
```

### Odpowiedź (success)

```json
{
  "success": true,
  "stats": {
    "worldsProcessed": 3,
    "vocationsProcessed": 12,
    "charactersCollected": 5000,
    "duration": 45000
  }
}
```

## Harmonogram

**Rekomendacja: uruchamiać co 12 godzin**

System zapisuje dane z 15-minutowym bucketing'iem — ta sama postać nie zostanie zapisana dwa razy w tym samym bucket'cie. Cron co 12 godzin wystarcza do regularnego odświeżania rankingu bez nadmiernego obciążania API TibiaData.

### GitHub Actions (recommended)

Plik `.github/workflows/cron-highscores.yml` już istnieje w repo:

```yaml
name: Cron - Highscores Collection

on:
  schedule:
    - cron: '0 */12 * * *' # Co 12 godzin

jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger highscores collection
        env:
          BACKEND_URL: ${{ secrets.BACKEND_URL }}
        run: |
          if [ -z "$BACKEND_URL" ]; then
            echo "Error: BACKEND_URL secret is not set"
            exit 1
          fi
          curl -X POST "${BACKEND_URL}/api/cron/highscores"
```

Secret do ustawienia w GitHub:

- `BACKEND_URL` - np. `https://yourdomain.com`

### Vercel Cron (na Vercel)

Plik `backend/src/app/api/cron/highscores/route.ts` już istnieje.

W `vercel.json` dodaj:

```json
{
  "crons": [
    {
      "path": "/api/cron/highscores",
      "schedule": "0 */12 * * *"
    }
  ]
}
```

### Linux crontab / Docker / inne

```bash
# /etc/cron.d/tibia-highscores
0 */12 * * * curl -s -X POST https://yourdomain/api/cron/highscores >> /var/log/cron-tibia.log 2>&1
```

## Dane w bazie

Cron zapisuje wszystkie znalezione postacie do tabel:

- **`character_highscores_snapshots`** - snapshot każdej postaci z rankingiem i EXP
  - Kolumny: `id`, `character_name`, `normalized_name`, `world`, `vocation`, `level`, `rank`, `exact_experience`, `checked_at`
  - Index: `(normalized_name, world, checked_at DESC)` - szybkie zapytania po nazwie

- **`character_highscores_last_save`** - tracking bucketing'u
  - Kolumny: `id`, `normalized_name`, `world`, `last_save_bucket`
  - Unique: `(normalized_name, world)` - każda postać zapisze się co najwyżej raz na 15 minut

### 15-minute Bucketing

Timestamp zaokrąglany do nearest 15-minutowego przedziału:

- 10:00 - 10:14:59 → bucket `10:00`
- 10:15 - 10:29:59 → bucket `10:15`
- 10:30 - 10:44:59 → bucket `10:30`
- 10:45 - 10:59:59 → bucket `10:45`
- 11:00 - itd.

## Monitoring

### Logi

Sprawdzaj logi backendu (scope: `cron`):

```json
{
  "level": "info",
  "scope": "cron.start",
  "message": "Starting cron highscores collection"
}
```

### Query do bazy - ostatnie dane

```sql
-- Ile postaci zostało zapisane w ostatnich 15 minutach
SELECT COUNT(*) FROM character_highscores_snapshots
WHERE checked_at > NOW() - INTERVAL '15 minutes';

-- Top 10 postaci po EXP na Dia
SELECT character_name, vocation, rank, exact_experience, checked_at
FROM character_highscores_snapshots
WHERE world = 'Dia'
ORDER BY exact_experience DESC
LIMIT 10;

-- Historia jednej postaci
SELECT * FROM character_highscores_snapshots
WHERE normalized_name = 'barteeek'
ORDER BY checked_at DESC;
```

## Testowanie lokalnie

```bash
# Uruchom backend
cd backend
npm run dev

# W innym terminalu, testuj cron
curl -X POST http://localhost:3000/api/cron/highscores
```

## Troubleshooting

### Timeout

- Endpoint ma limit 5 minut
- Jeśli trwa dłużej, zmniejsz liczbę światów w `CRON_WORLDS`

### Dane nie są zapisywane

- Sprawdź czy migracje uruchomiły się: `character_highscores_snapshots` i `character_highscores_last_save` powinny istnieć
- Sprawdzaj logi: `scope: "cron.error"`
