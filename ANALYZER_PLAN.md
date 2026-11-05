# Analyzer - plan produktu multi-game

> **Status:** plan, nic nie jest wdrożone. Nazwa robocza: **Analyzer**.
> Osobny produkt rozwijany w monorepo OmniFrame, od pierwszego dnia
> projektowany tak, żeby dało się go wydzielić do własnego repozytorium
> bez zmian w kodzie. Przy starcie implementacji plik przenosimy do
> `analyzer/PLAN.md`.

## 0. Założenia i granice

- **Cel:** inteligentny asystent i analizator rozgrywki (w stylu Mobalytics / Tracker.gg).
  Daje automatyczne porady i wykresy progresu na podstawie logów, statystyk i API gier.
- **Pierwszy moduł:** Tibia - wklejane teksty z analyserów klienta (Hunting Session,
  Party Hunt, Damage Input, Loot itd.).
- **Kolejne moduły:** gry z API (MOBA, FPS, RPG) - dodawane bez przebudowy rdzenia.
- **Pełna niezależność od obecnego OmniFrame:**
  - własny frontend, backend, baza, kontrakty DTO, konfiguracja, sekrety, wersjonowanie i deployment,
  - zero importów z `frontend/`, `backend/`, `shared/` (i odwrotnie) - wymuszone lintem i testem CI,
  - jedyne punkty styku: **tożsamość Google (`sub`)** oraz **link URL** z ekranu wyboru.
- **Konwencje kopiujemy jako zasady, nie jako kod:** DTO w camelCase, jeden format błędu
  `{ error: { code, message } }`, czas ISO 8601 UTC, Clean Code, quality gate
  (`format:check`, `lint`, `build`, `test`), Conventional Commits.
- **Uczciwa gra:** tylko dane wklejone przez gracza albo oficjalne API. Żadnego czytania
  pamięci klienta, sniffowania pakietów ani automatyzacji - zgodność z regulaminem
  CipSoft i innych wydawców.

## 1. Logowanie i wybór: Serwis czy Analyzer

### 1.1 Flow użytkownika

1. Użytkownik loguje się w OmniFrame tak jak dziś (Google).
2. Po zalogowaniu trafia na ekran wyboru `/start` z dwoma kafelkami:
   - **Serwis Tibia** - obecny dashboard `/`,
   - **Analyzer** - zewnętrzny adres `ANALYZER_WEB_URL` z konfiguracji.
3. Opcjonalnie: „zapamiętaj mój wybór” i przełącznik aplikacji w nawigacji obu produktów.
4. Analyzer ma link powrotny do serwisu (konfigurowalny URL, ukrywany po wydzieleniu).

### 1.2 Uwierzytelnianie w Analyzerze

- **Etap 1 (rekomendowany na start) - własne logowanie Google w Analyzerze**
  - Google Identity Services z `auto_select` / One Tap: użytkownik, który przed chwilą
    zalogował się w OmniFrame, przechodzi automatycznie albo jednym kliknięciem.
  - Ten sam użytkownik Google = ten sam `sub` w obu systemach, bez wspólnej bazy.
  - Analyzer działa samodzielnie od pierwszego dnia - po wydzieleniu nic się nie zmienia.
- **Etap 2 (opcjonalny SSO) - handoff token**
  - Backend OmniFrame wystawia krótkotrwały JWT (np. 60 s) podpisany kluczem
    asymetrycznym (EdDSA / RS256), `aud=analyzer`, z `sub`, `email`, `name`.
  - Analyzer weryfikuje go po publicznym JWKS (`OMNIFRAME_JWKS_URL` w env)
    i zakłada własną sesję.
  - Zależność tylko od standardu (JWKS), wyłączana flagą.
- **Sesja Analyzera jest całkowicie osobna:** własne cookies (`analyzer.session`,
  `analyzer.refresh`), własny issuer/audience JWT, własne sekrety.

### 1.3 Jedyne zmiany w istniejącym OmniFrame

- Komponent `/start` (za `authGuard`, `noindex`) z dwoma kafelkami.
- Przekierowanie po udanym logowaniu (i z `guestGuard`) na `/start` zamiast `/`.
- Zmienna `ANALYZER_WEB_URL` w konfiguracji frontendu.
- (Etap 2) endpoint wydający handoff token + publiczny endpoint JWKS w backendzie.

## 2. Architektura (pytanie 1)

### 2.1 Styl: modularny monolit + moduły gier

- Jeden frontend i jeden backend Analyzera, wewnętrznie podzielone na **rdzeń (core)**
  i **moduły gier**.
- Rdzeń nie wie nic o Tibii. Każda gra rejestruje się przez kontrakt `GameModule`.
- Bez mikroserwisów na start. Granice modułów są na tyle twarde, że ciężki moduł
  (np. connector API z dużym ruchem) można później wyjąć do osobnego serwisu.

### 2.2 Kontrakt modułu gry (koncepcyjnie)

Każdy moduł dostarcza:

- `id`, `displayName`, wersję i feature flagę (`games.<id>.enabled`),
- `importers` - źródła danych: `paste` (tekst), `upload` (plik), `api` (connector);
  każde z `detect()`, `parse()` i `parserVersion`,
- `normalizer` - mapowanie wyniku parsera na kanoniczny model rdzenia (sesja, metryki, encje),
- `metricDefinitions` - katalog metryk: klucz, jednostka, sposób agregacji,
  kierunek „więcej = lepiej” (np. `tibia.xpPerHour`, `tibia.profitPerHour`),
- `insightRules` - reguły porad: wejście = sesja + historia + dane referencyjne,
  wyjście = porada z uzasadnieniem i dowodami,
- `referenceData` - dane gry (potwory, przedmioty, ceny, expowiska) z własnym
  procesem aktualizacji,
- `ui` - lazy-loaded trasy i widżety Angulara (formularz importu, karta sesji, wykresy).

### 2.3 Pipeline przetwarzania danych

```text
 Wejście (paste / upload / API)
   │
   ▼
 [1] Ingest     - zapis surowych danych (niezmienne) + hash treści + typ źródła
   ▼
 [2] Detect     - rozpoznanie typu (Hunting Session, Party Hunt, Damage Input, ...)
   ▼
 [3] Parse      - wersjonowany parser modułu -> typowany wynik specyficzny dla gry
   ▼
 [4] Normalize  - mapowanie na model rdzenia: sesja + metryki + encje
   ▼
 [5] Enrich     - dane referencyjne: ceny, odporności potworów, bonusy
   ▼
 [6] Analyze    - metryki pochodne, porównanie z historią, reguły -> porady
   ▼
 [7] Present    - raport sesji, wykresy progresu, porady, link do udostępnienia
```

Kluczowe zasady pipeline'u:

- **Surowe dane zawsze zapisane + `parserVersion`** - po poprawie parsera robimy
  reprocessing w tle, bez proszenia gracza o ponowne wklejenie.
- **Parser = czysta funkcja TypeScript bez I/O** - ten sam kod działa w przeglądarce
  (natychmiastowy podgląd przed zapisem) i na serwerze (źródło prawdy).
- **Idempotencja:** hash znormalizowanej treści + czas startu sesji + profil - brak duplikatów.
- **Porady deterministyczne i wyjaśnialne:** każda ma „dlaczego” i dane źródłowe.
  LLM pojawia się później i tylko do opisu, nigdy do liczenia.

### 2.4 Struktura katalogów

```text
analyzer/
├── package.json          # npm workspaces wyłącznie dla Analyzera
├── web/                  # Angular 22 + Vite - UI
├── api/                  # Next.js 16 App Router - REST API, joby, migracje SQL
│   └── migrations/
├── packages/
│   ├── contract/         # DTO i schematy API web <-> api (odpowiednik shared/)
│   ├── core/             # model domeny, kontrakt GameModule, silnik metryk i reguł
│   └── game-tibia/       # parsery, normalizer, metryki, reguły, dane referencyjne Tibii
├── AGENTS.md             # tworzony przy starcie implementacji
└── README.md             # tworzony przy starcie implementacji
```

### 2.5 Technologie (rekomendacja)

| Warstwa        | Wybór                                                                                   | Dlaczego                                                        |
| -------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Frontend       | Angular 22 + Vite, signals, standalone, lazy routes per moduł gry                       | ten sam know-how co OmniFrame, moduły gier ładowane na żądanie  |
| Wykresy        | Apache ECharts                                                                          | szeregi czasowe, duże zbiory, zoom, łatwy dark mode             |
| Backend        | Next.js 16 Route Handlers (tylko API), TypeScript strict                                | spójny stack, natywny deployment na Vercel                      |
| Walidacja      | Zod w `packages/contract`                                                               | jeden schemat = typy + walidacja requestów + wynik parserów     |
| Baza           | Neon Postgres - **osobny projekt**, schematy `core` i `<gra>`                           | niezależność, łatwe wydzielenie, JSONB na dane specyficzne gier |
| Dostęp do bazy | Drizzle ORM + migracje SQL                                                              | wiele tabel, typy end-to-end, działa z driverem HTTP Neona      |
| Joby           | tabela `core.jobs` (`FOR UPDATE SKIP LOCKED`) + Vercel Cron, później kolejka zewnętrzna | reprocessing, synchronizacja API, limity zapytań                |
| Cache          | in-memory TTL, przy skalowaniu Redis                                                    | ceny, dane referencyjne, odpowiedzi API gier                    |
| Testy          | Vitest + golden tests parserów na fixture'ach z realnych logów                          | parsery to serce produktu                                       |
| AI (później)   | LLM (np. Claude) do podsumowań sesji w języku naturalnym                                | operuje wyłącznie na już wyliczonych metrykach                  |
| Deployment     | 2 osobne projekty Vercel (`analyzer/web`, `analyzer/api`), własne domeny                | brak wpływu na `vercel.json` i build OmniFrame                  |

### 2.6 Jak dodać kolejną grę

1. Nowy pakiet `packages/game-<id>` implementujący `GameModule`.
2. Własny schemat Postgresa `<id>.*` na dane referencyjne i tabele specyficzne.
3. Connector API (gdy gra ma API): adapter z rate limiterem, retry/backoff,
   szyfrowanym przechowywaniem tokenów i synchronizacją przez joby.
4. Rejestracja modułu w API i lazy route w `web`, włączenie feature flagą.
5. Rdzeń bez zmian. Jeśli wymaga zmian - to sygnał do poprawy kontraktu.
   Zasada: abstrakcja trafia do `core` dopiero, gdy potrzebują jej co najmniej dwie gry.

## 3. Model danych (szkic)

Schematy Postgresa: `core` (wspólny dla wszystkich gier), `tibia` (moduł),
kolejne gry - własne schematy.

### 3.1 Schemat `core`

| Tabela                                                    | Najważniejsze kolumny                                                                                                                                    | Rola                                                                |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `accounts`                                                | `id uuid`, `google_sub` (unique), `email`, `display_name`, `locale`, `time_zone`, `created_at`                                                           | konto Analyzera                                                     |
| `game_profiles`                                           | `id`, `account_id`, `game_id`, `external_ref` (postać / PUUID), `display_name`, `region` (świat/serwer), `attributes jsonb`, `is_primary`, `verified_at` | postacie i konta w grach                                            |
| `imports`                                                 | `id`, `account_id`, `game_id`, `source_type` (np. `tibia.huntSession`), `raw_content`, `content_hash`, `parser_version`, `status`, `error_code`          | każde wklejenie / sync, podstawa reprocessingu                      |
| `sessions`                                                | `id`, `profile_id`, `import_id`, `kind` (`hunt`, `partyHunt`, `match`), `started_at`, `ended_at`, `duration_seconds`, `tags`, `payload jsonb`            | sesja / mecz - wspólna oś czasu                                     |
| `session_metrics`                                         | `session_id`, `profile_id`, `started_at`, `metric_key`, `value numeric`                                                                                  | liczby do wykresów (zdenormalizowane pod szybkie zapytania czasowe) |
| `session_entities`                                        | `session_id`, `entity_type` (`creature`, `item`, `damageType`, `damageSource`, `hero`, `weapon`), `entity_key`, `quantity`, `value`                      | rozbicia: zabicia, łup, obrażenia, bohaterowie                      |
| `insights`                                                | `id`, `profile_id`, `session_id?`, `rule_id`, `rule_version`, `severity`, `category`, `message_key`, `params jsonb`, `evidence jsonb`, `status`          | porady i ich cykl życia                                             |
| `goals`                                                   | `id`, `profile_id`, `metric_key`, `target_value`, `deadline`, `status`                                                                                   | cele i kamienie milowe                                              |
| `account_progress`, `achievements`, `achievement_unlocks` | poziom i XP konta, definicje odznak, odblokowania                                                                                                        | grywalizacja platformy                                              |
| `share_links`                                             | `slug`, `session_id` / `profile_id`, `visibility`, `expires_at`                                                                                          | publiczne raporty (opt-in)                                          |
| `jobs`                                                    | `id`, `type`, `payload`, `status`, `attempts`, `run_at`, `locked_until`, `error`                                                                         | kolejka zadań w tle                                                 |
| `connector_accounts`                                      | `account_id`, `game_id`, `provider`, `external_id`, `tokens_encrypted`, `last_sync_at`                                                                   | przyszłe połączenia z API gier                                      |

### 3.2 Schemat `tibia`

| Tabela          | Najważniejsze kolumny                                                                           | Rola                           |
| --------------- | ----------------------------------------------------------------------------------------------- | ------------------------------ |
| `creatures`     | `name`, `hp`, `experience`, `resistances jsonb` (żywioł -> %), `bestiary_class`, `charm_points` | słabości potworów, bestiariusz |
| `items`         | `name`, `npc_sell_price`, `market_price`, `market_world`, `price_updated_at`                    | wycena łupu                    |
| `hunting_spots` | `id`, `name`, `recommended_level`, `vocations`, `creatures`                                     | przypisanie sesji do expowiska |
| `imbuements`    | `id`, `name`, `effect`, `element`, `slot_types`, koszty tierów                                  | sugestie imbuementów           |

### 3.3 Zasady danych

- Kolumny `TIMESTAMPTZ`, w API ISO 8601 UTC.
- **Czas z logów Tibii nie ma strefy** (`From 2026-11-05, 14:23:11`) - przy imporcie
  konwertujemy do UTC na podstawie strefy przeglądarki (`Intl`), zapisanej też w `accounts.time_zone`.
- Brak kluczy obcych do bazy OmniFrame - łączy wyłącznie `google_sub`.
- RODO: usunięcie konta kasuje kaskadowo wszystkie dane, retencja surowych logów jest
  konfigurowalna, eksport danych na żądanie.

## 4. Funkcje (pytanie 2)

### 4.1 Tibia - źródła danych

| Źródło                   | Co daje                                                                                      | Kiedy  |
| ------------------------ | -------------------------------------------------------------------------------------------- | ------ |
| Hunting Session Analyser | czas sesji, Raw XP / XP, XP/h, loot, supplies, balance, damage, healing, zabite potwory, łup | MVP    |
| Party Hunt Analyser      | bilans każdego członka: loot, supplies, balance, damage, healing                             | MVP    |
| Damage Input Analyser    | otrzymane obrażenia wg żywiołu i źródła (potwora)                                            | MVP    |
| TibiaData API            | weryfikacja postaci: nazwa, świat, vocation, level (wywoływane bezpośrednio przez Analyzer)  | MVP    |
| Loot / Supply Analyser   | szczegóły łupu i zużycia                                                                     | po MVP |
| Impact / XP Analyser     | zadane obrażenia i leczenie, XP w czasie                                                     | po MVP |

### 4.2 Tibia - funkcje unikalne

MVP:

- **Raport sesji:** profit/h, XP/h, koszt supplies/h, wskaźnik supplies/loot.
- **Wykrywanie bonusów XP** z różnicy Raw XP vs XP (stamina, boost, prey, event),
  żeby porównywać sesje uczciwie.
- **Kalkulator podziału łupu party:** kto komu ile przelewa, gotowe komendy transferu do skopiowania.
- **Analiza otrzymanych obrażeń -> imbuementy ochronne:** rozkład żywiołów i źródeł,
  mapowanie żywioł -> imbuement (fire -> Dragon Hide, earth -> Snake Skin, ice -> Quara Scale,
  energy -> Cloud Fabric, death -> Lich Shroud, holy -> Demon Presence) z progiem opłacalności.
- **Element broni:** sugestia Scorch / Venom / Frost / Electrify / Reap na podstawie słabości
  zabijanych potworów, ważona liczbą zabić i HP.
- **Historia per postać i per expowisko** z wykresami XP/h i profit/h.
- **Porównanie z własną historią:** np. „ten hunt dał o 25% mniej zysku niż Twoja mediana na tym spocie”.

Po MVP:

- Wycena łupu wg cen rynkowych świata (Market vs NPC) i podpowiedzi „gdzie sprzedać”.
- Ranking expowisk dla poziomu i profesji z anonimowych danych społeczności, percentyl na spocie.
- ETA do docelowego poziomu przy obecnym tempie (formuła EXP Tibii:
  `exp(L) = 50/3 * (L³ - 6L² + 17L - 12)`).
- Postęp bestiariusza, charm points i bosstiary z liczby zabić.
- Rekomendacje EQ na podstawie bazy przedmiotów i otrzymanych żywiołów, z wariantami kosztowymi.
- Ocena ryzyka: maksymalny otrzymany DPS vs pula HP -> ostrzeżenia i sugestie supplies/healingu.
- Analiza drop rate'ów (rzadkie dropy vs oczekiwane).
- Planer polowań party: kompozycja profesji, rozkład kosztów.

### 4.3 Rdzeń - funkcje wspólne dla wszystkich gier

- **Konto i profile:** wiele postaci/kont na grę, profil główny, weryfikacja własności
  (w Tibii: jednorazowy kod w komentarzu postaci sprawdzany przez TibiaData).
- **Import danych:** paste / upload / sync z API, historia importów, reprocessing.
- **Oś czasu aktywności:** sesje i mecze, filtry, tagi, notatki.
- **Silnik metryk i wykresów:** dowolna metryka w czasie, porównanie okresów,
  średnie kroczące, rekordy osobiste.
- **Silnik porad:** reguły z dowodami, priorytety, statusy (nowa / odrzucona / zastosowana),
  pomiar skuteczności (czy metryka poprawiła się po zastosowaniu porady).
- **Cele i kamienie milowe:** level, ranga, winrate, z ETA.
- **Benchmarki społeczności:** percentyle, anonimizacja, minimalna wielkość próbki.
- **Grywalizacja platformy:** poziom i XP konta Analyzera za aktywność, odznaki, serie dni.
- **Udostępnianie:** publiczny raport sesji / profilu (opt-in) z metadanymi SEO i OG.
- **Powiadomienia i eksport:** nowy rekord, osiągnięty cel, eksport CSV/JSON.
- **Jakość UI:** i18n (PL/EN na start), dark mode, dostępność, stany loading/empty/error.
- **Panel admina:** wersje parserów, błędy parsowania (próbki tylko za zgodą), feature flagi,
  aktualizacja danych referencyjnych.

### 4.4 Kandydaci na kolejne moduły

- **Dota 2 (OpenDota API)** - pierwszy kandydat do sprawdzenia abstrakcji: inny typ źródła
  (API zamiast logów), publiczne API, bogate dane meczowe.
- **League of Legends / Valorant (Riot API)** - po uzyskaniu klucza produkcyjnego i weryfikacji warunków.
- **Path of Exile (oficjalne API)** - RPG z danymi postaci i ekwipunku.
- Przed każdą grą: weryfikacja regulaminu API, limitów i dopuszczalnego przechowywania danych.

## 5. Plan MVP (pytanie 3)

**Zakres MVP w jednym zdaniu:** gracz Tibii loguje się, wybiera Analyzer, podpina postać,
wkleja log Hunting Session / Party Hunt / Damage Input, dostaje raport z poradami
i widzi historię z wykresami.

**Poza MVP:** kolejne gry, connectory API, LLM, benchmarki społeczności, ceny rynkowe, grywalizacja.

### Faza 0 - Fundamenty niezależności

- Szkielet `analyzer/` (npm workspaces): `web`, `api`, `packages/{contract,core,game-tibia}`.
- TypeScript strict, ESLint (`--max-warnings=0`), Prettier, Vitest, własne skrypty quality gate.
- **Reguły izolacji:** `no-restricted-imports` w obu kierunkach (Analyzer <-> OmniFrame)
  oraz job CI „extraction check”: kopiuje `analyzer/` do pustego katalogu i buduje go samodzielnie.
- Osobny projekt Neon, runner migracji, `.env.example`.
- Dwa projekty Vercel, workflow GitHub Actions uruchamiany na zmianach w `analyzer/**`.
- Decyzja o wersjonowaniu: trzecia aplikacja w `scripts/release.mjs` / `releases.yaml`
  albo osobny changelog Analyzera.
- **DoD:** pusta aplikacja wdrożona, CI zielone, import z `frontend/` lub `backend/` łamie lint.

### Faza 1 - Tożsamość i ekran wyboru

- Analyzer: logowanie Google, sesja JWT w cookies, `core.accounts`, `GET /api/me`.
- OmniFrame: ekran `/start` (Serwis / Analyzer), przekierowanie po logowaniu, `ANALYZER_WEB_URL`.
- **DoD:** po logowaniu w OmniFrame użytkownik wybiera Analyzer i jest w nim zalogowany
  tym samym kontem Google.

### Faza 2 - Rdzeń domeny

- Kontrakt `GameModule` i rejestr modułów.
- Migracje: `game_profiles`, `imports`, `sessions`, `session_metrics`, `session_entities`, `jobs`.
- `POST /api/imports`: detect -> parse -> normalize -> zapis, idempotencja po hashu.
- Worker jobów (na start: reprocessing importów).
- **DoD:** testowy moduł `game-dummy` przechodzi cały pipeline - dowód, że rdzeń nie zależy od Tibii.

### Faza 3 - Moduł Tibia: parsery

- Zbiór fixture'ów z realnych logów każdego analysera: krótkie i długie sesje, puste sekcje,
  party 2-5 osób, nietypowe nazwy przedmiotów i potworów, duże liczby.
- Parsery: Hunting Session, Party Hunt, Damage Input; autodetekcja typu;
  czytelne błędy ze wskazaniem linii.
- Golden tests (fixture -> oczekiwany JSON) i testy property-based dla formatów liczb.
- Podpięcie postaci przez TibiaData (nazwa, świat, vocation, level).
- UI importu: pole tekstowe + podgląd na żywo (parser w przeglądarce) + zapis.
- **DoD:** co najmniej 95% realnych fixture'ów parsuje się bez błędu, nieparsowalne
  trafiają do raportu błędów.

### Faza 4 - Raport sesji i historia

- Karta sesji: KPI (XP/h, profit/h, balance, supplies/h), zabite potwory, łup, obrażenia.
- Lista sesji z filtrami (postać, expowisko, okres, tagi), edycja tagów i expowiska.
- Wykresy progresu: XP/h, profit/h, level w czasie, porównanie expowisk.
- **DoD:** gracz widzi trend z ostatnich 30 dni.

### Faza 5 - Porady v1

- Silnik reguł w `core` + 6-10 reguł Tibii:
  imbuementy ochronne z Damage Input, element broni ze słabości potworów,
  za wysoki stosunek supplies/loot, sesja poniżej mediany spotu, wykrycie bonusów XP,
  ryzyko (maksymalny DPS vs HP).
- Kalkulator podziału łupu party z komendami transferów.
- Każda porada: uzasadnienie, dane źródłowe, akcje „zastosowałem” / „odrzuć”.
- **DoD:** każda reguła ma testy na fixture'ach i treść w PL i EN.

### Faza 6 - Domknięcie MVP

- i18n PL/EN, dark mode, stany loading/empty/error, dostępność.
- Publiczna strona startowa Analyzera pod SEO (unikalny tytuł i opis, canonical, robots,
  sitemap, dane strukturalne); trasy prywatne z `noindex`.
- RODO: eksport i usunięcie danych, polityka retencji surowych logów.
- Telemetria produktowa (liczba importów, błędy parsowania, użycie porad) bez danych osobowych.
- **DoD:** quality gate zielony, zamknięta beta z grupą graczy.

### Co kodujemy na samym początku (kolejność)

1. Szkielet `analyzer/` + reguły izolacji + CI (Faza 0).
2. Model kanoniczny w `packages/core`: sesja, metryka, encja, porada, kontrakt `GameModule`.
3. Parser Hunting Session Analyser + fixture'y + golden tests - czysty TS, bez UI i bazy.
4. Migracje `core.*` i endpoint importu.
5. UI: wklej -> podgląd -> zapisz -> raport.
6. Pierwsze 3 reguły porad.
7. Logowanie i ekran wyboru - równolegle od kroku 2 (wymagane przed zapisem danych per użytkownik).

## 6. Roadmapa po MVP

- **v1.1:** Loot / Supply / Impact Analyser, ceny rynkowe i wycena łupu, ETA poziomu, cele.
- **v1.2:** benchmarki społeczności, ranking expowisk, publiczne raporty, grywalizacja.
- **v1.3:** podsumowania sesji przez LLM, pytania w języku naturalnym o własne sesje.
- **v2.0:** druga gra z connectorem API - weryfikacja abstrakcji i refaktor rdzenia na podstawie wniosków.
- **v2.x:** kolejne gry, PWA / aplikacja mobilna, aplikacja towarzysząca na desktop
  (wyłącznie w granicach regulaminów gier).

## 7. Wydzielenie z monorepo - checklista

- [ ] Brak importów spoza `analyzer/` (lint i extraction check zielone).
- [ ] Własne env, sekrety, baza i projekty Vercel - nic nie trzeba przenosić.
- [ ] `git subtree split --prefix=analyzer -b analyzer-split` i push do nowego repo (z historią).
- [ ] SSO handoff wyłączony flagą albo pozostawiony przez `OMNIFRAME_JWKS_URL`.
- [ ] Kafelek na `/start` w OmniFrame usunięty albo wskazuje nowy URL.
- [ ] Workflow CI i wersjonowanie przeniesione do nowego repo.

## 8. Ryzyka i mitygacje

| Ryzyko                                                      | Mitygacja                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Format logów zmienia się z aktualizacjami klienta Tibii     | wersjonowane parsery, fixture'y per wersja, reprocessing, telemetria błędów parsowania     |
| Czas w logach bez strefy                                    | strefa z przeglądarki przy imporcie, zapis w UTC                                           |
| Separatory tysięcy, długie listy, znaki specjalne w nazwach | golden tests i testy property-based                                                        |
| Brak oficjalnego API dla odporności potworów i cen          | własny import danych referencyjnych (np. TibiaWiki z atrybucją CC BY-SA), data aktualności |
| Limity Vercel (czas funkcji, rozmiar body)                  | logi są małe; ciężkie operacje w jobach                                                    |
| Koszty bazy i LLM                                           | cache, limity per użytkownik, LLM tylko na metrykach                                       |
| Prywatność - logi party zawierają nazwy innych graczy       | minimalizacja, retencja, brak publikacji bez zgody                                         |
| Przeprojektowanie multi-game przed drugą grą                | minimalny rdzeń, abstrakcje dopiero przy dwóch grach                                       |

## 9. Decyzje do potwierdzenia

1. Docelowa nazwa produktu i domena Analyzera.
2. Ten sam Google OAuth client co OmniFrame czy osobny (rekomendacja: osobny - prostsze wydzielenie).
3. Osobny projekt Neon czy osobna baza w obecnym projekcie (rekomendacja: osobny projekt).
4. Czy ekran wyboru zapamiętuje ostatni wybór i pomija się przy kolejnym logowaniu.
5. Czy SSO handoff (etap 2) jest potrzebny, czy wystarczy One Tap.
6. Wersjonowanie: trzecia aplikacja w `releases.yaml` czy osobny changelog.
