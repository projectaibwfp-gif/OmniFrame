# Copilot / Agent instructions

Zasady, których agent **musi zawsze przestrzegać** przy pracy nad tym repo.

## Frontend – Angular 22

- Używaj signal-based API: `signal()`, `computed()`, `effect()`, `input()`, `output()`, `model()`, `viewChild.required()`, `contentChild()`.
- **Nie używaj** dekoratorów `@ViewChild` / `@Input` / `@Output` – zastąp je odpowiednikami sygnałowymi.
- DI wyłącznie przez `inject()` – bez wstrzykiwania przez konstruktor.
- Do inicjalizacji zależnej od DOM używaj `afterNextRender()` (nie `ngAfterViewInit`).
- Efekty uboczne reagujące na sygnały → `effect()` w konstruktorze.
- Każdy komponent ma `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Pomijaj `standalone: true`** – to domyślne od Angular 19+.
- Modyfikatory dostępu:
  - `private readonly` dla pól wewnętrznych,
  - `protected readonly` dla pól używanych w szablonie,
  - `public` tylko dla prawdziwego API komponentu.
- Async: `async/await` + `try/catch`; jeżeli świadomie ignorujemy Promise, poprzedzamy go `void`.
- W szablonach używaj nowej składni control flow: `@if`, `@for`, `@switch` (nie `*ngIf` / `*ngFor`).

## Clean Code

- Jedna funkcja = jedno zadanie. Długie metody `init` rozbijaj na małe, prywatne, mówiące własną nazwą (np. `captureReferralIfPresent()`, `renderGoogleButton()`).
- Nazwy opisowe, bez skrótów. Bez komentarzy tłumaczących "co robi kod" – kod ma być samoopisujący; komentarze tylko tam, gdzie tłumaczą **dlaczego**.
- Wczesne `return` zamiast zagnieżdżonych `if`.
- Bez magic numbers / magic stringów – wynoś do stałych lub zmiennych SCSS.

## SCSS komponentów

- **Wszystkie kolory pochodzą wyłącznie z `front/src/styles/_colors.scss`.** Import: `@use 'colors' as c;` (na górze pliku) i użycie: `c.$text-700` itd. Żaden komponent nie hardkoduje `#hex` / `rgb()` – gdy potrzebny jest nowy odcień, dodaj token do palety, a następnie referencję.
- Poza kolorami: pozostałe zmienne SCSS (spacing, breakpointy) na górze pliku pod importami.
- Selektory potomne zagnieżdżaj pod rootem komponentu (nesting), zamiast płaskich `.a .b`.
- **Wszystkie** style mobilne w **jednym** `@media (max-width: c.$bp-mobile)` (575.98px, zgodne z Bootstrap `sm`) na końcu pliku.
- Nie używaj gołych selektorów typu `h1`, `p` na poziomie pliku – zawsze scope'uj je pod komponent.

## Ogólne

- Przed zakończeniem zadania uruchom `npm run lint` (frontend) i upewnij się, że przechodzi bez ostrzeżeń (`--max-warnings=0`).
- Nie zmieniaj kodu niezwiązanego z zadaniem.
- Nie twórz plików markdown (planów, notatek) w repo bez wyraźnej prośby użytkownika.
