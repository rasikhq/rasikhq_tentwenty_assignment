# 04: Offline movie list

**What to build:** Movie List keeps working without a connection: reopening the app shows the last saved list instantly, offline use shows saved movies with an offline banner, and data refreshes itself when the app returns to the foreground or the connection comes back (ADR-0003).

**Blocked by:** 03 (Upcoming movie list)

**Status:** resolved

- [x] The query cache persists to AsyncStorage with a 7-day max age, `gcTime` at least as long, and a cache-buster tied to the app version.
- [x] Only the first 3 pages of the upcoming list persist; later tickets add their own persistence rules.
- [x] The list counts as stale after 1 hour and refetches on app foreground (focus manager wired to AppState), on reconnect (online manager wired to NetInfo) and on pull-to-refresh.
- [x] Offline with saved data: the saved movies plus a slim offline banner. Offline with nothing saved: a full offline state with Retry.
- [x] Posters seen before still show offline (expo-image disk cache).
- [x] Behaviour tests with the NetInfo and AsyncStorage Jest mocks: after an offline "restart" the saved movies and the banner show; offline with empty storage shows the offline state; reconnecting refetches.

## Decisions made while building

- Persistence lives in `createPersistOptions()` (`src/lib/queryClient.ts`), one persister per mounted app. `shouldPersist` is the single place later tickets add their queries; `trimForDisk` cuts the upcoming list to 3 pages.
- The cache-buster is the `version` in `app.json` (through expo-constants).
- Offline with nothing saved is detected as a paused query (`fetchStatus === 'paused'` with no data), since TanStack Query waits for a connection instead of failing.
- Backdrops use `cachePolicy="disk"` explicitly (expo-image's default) so the offline promise is visible in code. The disk image cache is native and not covered by a Jest test.
- Tests fake the date with `controlDate()` (`src/test/clock.ts`), which lets the real timers run.
