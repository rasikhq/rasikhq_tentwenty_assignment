# 02: Quality harness

**What to build:** The safety net every later ticket relies on: one command that typechecks, lints and runs the tests; a render helper that mounts the real app for behaviour tests with the network faked at the HTTP boundary; and CI that runs the same command.

**Blocked by:** 01 (App shell)

**Status:** ready-for-agent

- [ ] Jest with the `jest-expo` preset and React Native Testing Library 14, whose render and events are async and awaited.
- [ ] MSW pinned to 2.x (3.0 is ESM-only and dropped its React Native entry point), used through `msw/node`, with unhandled requests failing the test.
- [ ] A render helper mounts the production provider tree and the real root navigator, optionally starting at any route with params.
- [ ] Jest mocks for native modules are added as each module arrives (NetInfo and AsyncStorage come with ticket 04).
- [ ] First behaviour test: the app opens on Movie List and shows "Watch".
- [ ] ESLint with TypeScript rules, plus an import restriction so only the API module may import TMDb response types. The rule is in place before the module exists.
- [ ] `npm run check` runs typecheck, lint and tests, and passes.
- [ ] A GitHub Actions workflow runs `npm run check` on push, on pull request and manually.
- [ ] CLAUDE.md documents the commands, the testing approach (behaviour through the render helper; fakes only at the seams named in the spec), and the rule to run `npm run check` before every commit.
