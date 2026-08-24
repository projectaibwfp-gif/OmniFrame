# Cron Highscores Collection

Automatyczne pobieranie i zapisywanie danych postaci z Tibia highscores.

## Konfiguracja

### Zmienne środowiskowe (`.env`)

```
# API key do autoryzacji cron endpointu (wymagane)
CRON_API_KEY=7f8a9b3c2d4e5f6g7h8i9j0k1l2m3n4o

# Lista światów do skanowania (opcjonalne, domyślnie: Dia,Amera,Antica)
CRON_WORLDS=Dia,Amera,Antica
```

## Użycie

### POST Request

```bash
curl -X POST https://yourdomain/api/cron/highscores \
  -H "X-API-Key: 7f8a9b3c2d4e5f6g7h8i9j0k1l2m3n4o"
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

### Odpowiedź (error - brak klucza)

```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Unauthorized"
  }
}
```

HTTP Status: 401

## Harmonogram

**Rekomendacja: uruchamiać co 15 minut**

Powód: System zapisuje dane z 15-minutowym bucketing'iem - ta sama postać nie będzie zapisana 2 razy w ciągu 15 minut.

### GitHub Actions (recommended)

Utwórz `.github/workflows/cron-highscores.yml`:

```yaml
name: Cron - Highscores Collection

on:
  schedule:
    - cron: '*/15 * * * *'  # Co 15 minut

jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger highscores collection
        run: |
          curl -X POST ${{ secrets.BACKEND_URL }}/api/cron/highscores \
            -H "X-API-Key: ${{ secrets.CRON_API_KEY }}"
```

Secrets do ustawienia w GitHub:
- `BACKEND_URL` - np. `https://yourdomain.com`
- `CRON_API_KEY` - `7f8a9b3c2d4e5f6g7h8i9j0k1l2m3n4o`

### Vercel Cron (na Vercel)

Plik `backend/src/app/api/cron/highscores/route.ts` już istnieje.

W `vercel.json` dodaj:

```json
{
  "crons": [
    {
      "path": "/api/cron/highscores",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Na panelu Vercel ustawić zmienną środowiskową:
- `CRON_API_KEY`: `7f8a9b3c2d4e5f6g7h8i9j0k1l2m3n4o`

### Linux crontab / Docker / inne

```bash
# /etc/cron.d/tibia-highscores
*/15 * * * * curl -s -X POST https://yourdomain/api/cron/highscores \
  -H "X-API-Key: 7f8a9b3c2d4e5f6g7h8i9j0k1l2m3n4o" >> /var/log/cron-tibia.log 2>&1
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
curl -X POST http://localhost:3000/api/cron/highscores \
  -H "X-API-Key: 7f8a9b3c2d4e5f6g7h8i9j0k1l2m3n4o"
```

(Upewnij się że w `backend/.env` masz: `CRON_API_KEY=7f8a9b3c2d4e5f6g7h8i9j0k1l2m3n4o`)

## Troubleshooting

### "Unauthorized" (401)

- Sprawdź czy `CRON_API_KEY` w `.env` backendu jest ustawiony
- Sprawdź czy `X-API-Key` header w requestzie dokładnie odpowiada wartości `CRON_API_KEY`
- Wielkość liter ma znaczenie (case-sensitive)

### Timeout

- Endpoint ma limit 5 minut
- Jeśli trwa dłużej, zmniejsz liczbę światów w `CRON_WORLDS`

### Dane nie są zapisywane

- Sprawdź czy migracje uruchomiły się: `character_highscores_snapshots` i `character_highscores_last_save` powinny istnieć
- Sprawdzaj logi: `scope: "cron.error"`

