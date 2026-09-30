## Commands

- `npm run check` runs the typecheck, lint and tests, exactly as CI does. Run it before every commit, and commit only when it passes.
- `npx jest <path>` runs one test file. `npm run typecheck`, `npm run lint` and `npm test` run one stage each. Lint fails on any warning.

## Testing

Tests prove behaviour the way a user meets it. The full approach is under "Testing Decisions" in `.scratch/tmdb-movie-booking/spec.md`.

- Render the whole app with `renderApp()` from `src/test/renderApp.tsx`: the production providers around the real root navigator, optionally starting at a route with its params. Drive it with RNTL's `userEvent` and assert on what the user perceives: visible text, roles, labels and states. Name tests in the glossary's language (`CONTEXT.md`).
- React Native Testing Library 14's `render` and events are async: `await` every call.
- Fake only at the seams the spec names, so everything between the screen and the network runs for real:
  - HTTP: MSW answers TMDb. Each test adds the endpoints it uses with `server.use()` from `src/test/server.ts`; a request without a handler fails the test.
  - Connectivity and disk: the official NetInfo and AsyncStorage Jest mocks.
  - Trailer player: a fake of our own trailer player component.
  - Clock: Jest's system time.
- A new native module gets its library's official Jest mock in `src/test/setup.ts`.
- Unit-test directly only the rules with many cases: trailer pick, bookable movie, hall layout to numbered seats, search term normalization.

## API boundary

Only `src/api/` knows TMDb's JSON shapes, which live in `src/api/tmdbTypes.ts`. Everything else imports the app types the API module maps responses into. ESLint enforces this, with the test fakes in `src/test/` exempt.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
