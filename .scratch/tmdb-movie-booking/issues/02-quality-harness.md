# 02: Quality harness

**What to build:** The safety net every later ticket relies on: one command that typechecks, lints and runs the tests; a render helper that mounts the real app for behaviour tests with the network faked at the HTTP boundary; and CI that runs the same command.

**Blocked by:** 01 (App shell)

**Status:** resolved

- [x] Jest with the `jest-expo` preset and React Native Testing Library 14, whose render and events are async and awaited.
- [x] MSW pinned to 2.x (3.0 is ESM-only and dropped its React Native entry point), used through `msw/node`, with unhandled requests failing the test.
- [x] A render helper mounts the production provider tree and the real root navigator, optionally starting at any route with params.
- [x] Jest mocks for native modules are added as each module arrives (NetInfo and AsyncStorage come with ticket 04).
- [x] First behaviour test: the app opens on Movie List and shows "Watch".
- [x] ESLint with TypeScript rules, plus an import restriction so only the API module may import TMDb response types. The rule is in place before the module exists.
- [x] `npm run check` runs typecheck, lint and tests, and passes.
- [x] A GitHub Actions workflow runs `npm run check` on push, on pull request and manually.
- [x] CLAUDE.md documents the commands, the testing approach (behaviour through the render helper; fakes only at the seams named in the spec), and the rule to run `npm run check` before every commit.

## Comments

**2026-09-30, implementation notes**

- Chosen with the user in this session: ESLint 9 with `eslint-config-expo` plus typescript-eslint's type-aware `recommendedTypeChecked`, where any warning fails lint, over Expo's config alone or untyped rules, because `no-floating-promises` catches an un-awaited RNTL 14 `render()` or event. TMDb response types will live in `src/api/tmdbTypes.ts`, blocked outside `src/api/` by the core `no-restricted-imports` rule, over `import/no-restricted-paths`, which skips imports it can't resolve and so couldn't fire before ticket 03 creates the file.
- Decided by the agent, then approved by the user: the boundary rule also exempts `src/test/`, because MSW handlers and fixture builders stand in for TMDb and need its JSON shapes. The spec says "only the API module knows TMDb's JSON shapes". The narrower option is to exempt only the fixture and handler files once ticket 03 creates them.
- The rule covers every TypeScript file outside `src/api/` and `src/test/`, including imports with an explicit `.ts` or `.js` extension. `@typescript-eslint/consistent-type-imports` is on, so an `import('...')` type, which `no-restricted-imports` can't see, fails lint as well. Checked with throwaway files and a stub `src/api/tmdbTypes.ts`: `import type`, `export type ... from`, both extensions and `import()` types fail lint in `src/screens/` and in a nested components folder, and the same imports pass in `src/api/` and `src/test/`. An un-awaited `renderApp()` fails with `no-floating-promises`.
- ESLint is 9.39.5, which npm now marks as unsupported. ESLint 10 is out, but the React plugins in eslint-config-expo (eslint-plugin-react 7.37, still used by eslint-config-expo 57) declare ESLint 9 at most. The user approved staying on ESLint 9; revisit when Expo's config moves.
- Versions: jest-expo 55.0.22 and Jest 29.7 from `npx expo install`, RNTL 14.0.1 with `test-renderer` 1.2 (1.3 needs React 19.3; the app is on 19.2), MSW 2.15.
- MSW in Jest needed two fixes in `jest.config.js`. `msw/node` maps the `react-native` export condition, which the React Native Jest environment resolves with, to null, so it's mapped to MSW's CommonJS build. MSW 2.12 and later also depend on ESM-only packages (`rettime`, `until-async`, `@open-draft/deferred-promise`), which Jest now compiles, `.mjs` files included. Pinning MSW 2.11, the last release without them, would avoid the compile step at the cost of staying on an old release. The user approved MSW 2.15 with the compile step. The compile list keeps only the scopes from jest-expo's list that this app uses.
- Unhandled requests: in MSW 2.15, `print.error()` inside a custom `onUnhandledRequest` only prints, and the request goes on to the real network. The first version of `src/test/setup.ts` relied on it, and the code review caught it. The setup now records the request and throws, so MSW answers 500 and nothing leaves the process, and `afterEach` fails the test with the request listed. `afterEach` unmounts first with RNTL's `cleanup()`, so a request sent while unmounting fails its own test rather than the next one. After a file's last test MSW stops intercepting, so `fetch` is swapped for one that rejects, and a timer or retry that fires late can't reach the network either.
- Checked with throwaway tests against a local HTTP server: a handled request got its fake response; unhandled requests during a test, while unmounting and after the last test never reached the server; the first two failed their own tests; handlers reset between tests. Jest's Node environment has no `XMLHttpRequest`, so the API client should use `fetch`.
- `renderApp()` renders the production `App`, which takes an optional `initialNavigationState` that only tests pass. Starting at a route goes through the real `NavigationContainer`. Ticket 04 should create the query client inside `App` (for example in `useState`), so every render, including a test's "restart", gets a fresh client that restores from storage.
- Native module mocks so far: only `react-native-safe-area-context`, whose provider renders nothing in Jest until native insets arrive. Reanimated, Screens and the Expo modules needed none. `.css` imports map to an empty module, since Jest has no CSS step.
- Jest doesn't load `.env`, and `process.env.EXPO_PUBLIC_TMDB_TOKEN` stays a runtime read under Jest rather than being inlined. Ticket 03 can set a fake token in `src/test/setup.ts`, and a test can delete it to cover the missing-token error.
- expo-modules-core types `process.env` values as `any`, which type-aware lint rejects, so `src/api/token.ts` declares `EXPO_PUBLIC_TMDB_TOKEN` on `NodeJS.ProcessEnv`. React Navigation's global param-list typing needed two rule options: `no-namespace` with `allowDeclarations` and `no-empty-object-type` with `allowInterfaces: 'with-single-extends'`.
- RNTL 14 needs Node `^22.13.0 || >=24`, so the README now asks for Node 22 (22.13 or newer) or Node 24 and later, and CI runs Node 22.
- CI runs `npm ci` and `npm run check` on `actions/checkout@v7` and `actions/setup-node@v7` with a read-only token. The repo has no GitHub remote yet, so the workflow hasn't run on GitHub. Instead, a clean copy of the committable files passed a fresh `npm ci` and `CI=true npm run check`.
- Code review ran as Standards and Spec sub-agents. Besides the MSW passthrough, it found the unmount ordering, the lint gaps, the extra packages in the compile list, the README allowing Node 23, and a wrong note blaming `@types/node` for the `any` env type. All are fixed.
- Verified: `npm run check` passes (typecheck, lint with no warnings, 1 test). The behaviour test fails when the header text changes, so it isn't vacuous.
- Local only: every Jest run prints a watchman "Recrawled this watch" warning. It comes from this machine's watchman state, not the config, and running `watchman watch-del` then `watchman watch-project` on the repo clears it.
