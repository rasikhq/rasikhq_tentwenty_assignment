# 04: Offline movie list

**What to build:** Movie List keeps working without a connection: reopening the app shows the last saved list instantly, offline use shows saved movies with an offline banner, and data refreshes itself when the app returns to the foreground or the connection comes back (ADR-0003).

**Blocked by:** 03 (Upcoming movie list)

**Status:** ready-for-agent

- [ ] The query cache persists to AsyncStorage with a 7-day max age, `gcTime` at least as long, and a cache-buster tied to the app version.
- [ ] Only the first 3 pages of the upcoming list persist; later tickets add their own persistence rules.
- [ ] The list counts as stale after 1 hour and refetches on app foreground (focus manager wired to AppState), on reconnect (online manager wired to NetInfo) and on pull-to-refresh.
- [ ] Offline with saved data: the saved movies plus a slim offline banner. Offline with nothing saved: a full offline state with Retry.
- [ ] Posters seen before still show offline (expo-image disk cache).
- [ ] Behaviour tests with the NetInfo and AsyncStorage Jest mocks: after an offline "restart" the saved movies and the banner show; offline with empty storage shows the offline state; reconnecting refetches.
