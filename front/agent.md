1. Before completing a change, run `npm run format:check`, `npm run lint`, `npm test`, and `npm run build`.
2. For backend Route Handlers in Next.js, keep production files named `route.ts`, but name test files descriptively instead of repeating generic `route.test.ts`.
3. Prefer endpoint-focused test names such as `health.get.test.ts`, `google.post.test.ts`, `users.api.test.ts`, or `dashboard.get.test.ts` so test reports are readable without opening the file tree.
4. Keep API tests close to the route they cover and use the `.test.ts` suffix consistently.
5. Every endpoint should have at least two automated cases: one happy path and one failure path, such as validation, authorization, or downstream error.
6. For Route Handler tests, mock external boundaries like auth, database, cookies, and third-party services, then assert both HTTP status and JSON payload.
7. When a route supports multiple methods, cover each method explicitly and prefer one focused expectation per scenario over broad integration-style assertions.
8. Use `backend/shared/api-contract.ts` as the source of truth for API DTOs shared between front and backend, and do not commit `front/out-tsc/` artifacts.
