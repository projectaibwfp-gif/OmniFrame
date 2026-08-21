1. Before completing a change, run `npm run format:check`, `npm run lint`, `npm test`, and `npm run build`.
2. For backend Route Handlers in Next.js, keep production files named `route.ts`, but name test files descriptively instead of repeating generic `route.test.ts`.
3. Prefer endpoint-focused test names such as `health.get.test.ts`, `google.post.test.ts`, `users.api.test.ts`, or `dashboard.get.test.ts` so test reports are readable without opening the file tree.
4. Keep API tests close to the route they cover and use the `.test.ts` suffix consistently.
5. Every endpoint should have at least two automated cases: one happy path and one failure path, such as validation, authorization, or downstream error.
6. For Route Handler tests, mock external boundaries like auth, database, cookies, and third-party services, then assert both HTTP status and JSON payload.
7. When a route supports multiple methods, cover each method explicitly and prefer one focused expectation per scenario over broad integration-style assertions.
8. Use `shared/api-contract.ts` as the source of truth for API DTOs shared between front and backend, and do not commit `front/out-tsc/` artifacts.
9. Keep shared API DTOs in camelCase; reserve snake_case only for database row mapping and SQL boundaries.
10. **Component Structure**: Always separate component files into individual `.ts` (logic), `.html` (template), and `.scss` (style) files. Never use inline `template:` or `styles:` — use `templateUrl:` and `styleUrl:` instead. Organize related components in subdirectories (e.g., `src/app/components/language-switcher/`).
11. **i18n (Internationalization)**: Frontend supports English (en) and Polish (pl). Add translations in `src/i18n/messages.{en,pl}.xlf`. Use `LocalizationService` to get current locale or switch languages. Display language switcher in topbar for users to change locale dynamically. Navigation labels and static text should respect the current locale signal.