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

- Persistence lives in `createPersistOptions()` (`src/lib/queryClient.ts`), one persister per mounted app. `shouldPersist` is the single place later tickets add their queries; `trimForDisk` cuts the upcoming list to 3 pages. A query whose refetch failed still persists its last data.
- The persister dates a saved copy by its oldest data, not by the moment of writing, so reopening the app doesn't restart the 7 days. Ticket 05 replaced this: once details are saved beside the list, the oldest query would take the fresher ones down with it, so each saved query now expires on its own age when the cache is restored, and the copy is dated by its last write. Writes are throttled to 300 ms, so a write lost on closing the app is unlikely.
- The cache-buster is the `version` in `app.json` (through expo-constants). The app throws if it is missing, rather than running without a buster.
- `staleTime` of 1 hour belongs to the upcoming list query. Other queries set their own (24 hours for a detail, 7 days for genres). `gcTime` is global, at the persister's max age.
- Online means NetInfo reports a connection and not `isInternetReachable === false`, so Wi-Fi without internet counts as offline.
- Offline with nothing saved is detected as a paused query (`fetchStatus === 'paused'` with no data), since TanStack Query waits for a connection instead of failing. Retry there asks NetInfo to check again. Pulling the list down while offline does nothing, instead of spinning until the connection returns.
- Backdrops use `cachePolicy="memory-disk"`. The disk image cache is native and not covered by a Jest test: check on a device.
- Tests fake the date with `controlDate()` (`src/test/clock.ts`), which lets the real timers run, and fake NetInfo's `addEventListener` and `refresh` on top of its official mock, which reports nothing. Jest's `expo-constants` is `app.json`.
