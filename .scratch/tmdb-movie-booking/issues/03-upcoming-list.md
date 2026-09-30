# 03: Upcoming movie list

**What to build:** The app's entry point, end to end: upcoming movies from TMDb as Figma-style cards that load more as the user scrolls, with pull-to-refresh and every state designed. This is the first real path through every layer: API client, mapping, query, screen and tests.

**Blocked by:** 02 (Quality harness)

**Status:** resolved

- [x] The API client calls TMDb with the Read Access Token as a Bearer header, passes the query's `AbortSignal` to every request, and turns failures into typed errors: token missing or invalid, not found, rate limited, offline or network failure, server error.
- [x] Only the API module knows TMDb's JSON: upcoming results are mapped into app movie types, and screens import app types only.
- [x] Query keys come from one central factory.
- [x] Movie List shows upcoming movies as cards (backdrop image, title over a darkening gradient) using expo-image, with an image size chosen for the card slot rather than `original`.
- [x] More pages load on scroll (FlashList with an infinite query); pull-to-refresh refetches.
- [x] One column below the wide breakpoint and two above it, driven by window width.
- [x] Loading shows skeleton cards; a failed load shows a message with Retry that recovers; an empty response shows specific empty text.
- [x] Real TMDb responses are checked: whether pages repeat movies (if so, flattening de-duplicates by movie id), whether a region parameter is needed, and whether past release dates appear. Findings go in this ticket's Comments.
- [x] Behaviour tests: the list renders movies served by MSW; scrolling loads the next page; an error followed by Retry shows movies; repeated movies render once if de-duplication was needed.

## Comments

**2026-09-30, implementation notes**

- Real TMDb responses, checked with the project's token by crawling up to 30 pages of `/movie/upcoming`, with and without `region=US`:
  - Pages repeat movies. Without a region, 600 movies over 30 pages held 541 distinct ids (59 repeats). With `region=US`, 155 movies over 8 pages held 149 (6 repeats). Every repeat sat at a page boundary: the end of one page comes back near the start of the next. Paging isn't stable either, so some movies never show up in a crawl, and `total_pages` for `region=US` went from 7 to 8 between requests. The list therefore flattens its pages and de-duplicates by movie id, keeping the first appearance.
  - A region isn't needed for requests to work, but it changes the list a lot. Without one, TMDb returns 1,823 movies over 92 pages (release window 2026-09-30 to 2026-10-21), and only 39% of the first 600 are English. With `region=US` it returns 139 movies over 7 to 8 pages (window 2026-10-07 to 2026-10-28), 76% English. Chosen with the user: `region=US`, because the app prices in dollars, shows English text and formats dates the en-US way. It's the constant `UPCOMING_REGION` in `src/api/movies.ts`. A device region would need `expo-localization`, and the spec puts localization out of scope.
  - Past release dates do appear. `release_date` is a movie's primary date, not its date in the region's window, so re-releases and regional releases carry old dates. Without a region, 215 of 600 (36%) were dated before today, back to 1953-06-05. With `region=US`, 17 of 155 (11%) were, and 53 fell before the window's start (a 2006 re-release of Pan's Labyrinth among them). The list doesn't filter them: TMDb lists them as upcoming, and the bookable movie rule in ticket 05 already treats an old date as not bookable.
  - Many upcoming movies have no backdrop yet: `backdrop_path` was null for 141 of 600 (24%), and for 55 of 155 (35%) with `region=US`, against 7 to 8% for posters. The card keeps its navy background and its title when there's no image.
  - Errors: a bad token gives 401 (`status_code` 7), an unknown id 404 (6), and a page below 1 or above 500 gives 400 (22, "Pages start at 1 and max at 500"). A status the client has no kind for, such as that 400, becomes the `server` kind. Search and genre lists (tickets 09 and 12) must keep their page at 500 or below.
  - `/configuration` lists the backdrop sizes `w300`, `w780`, `w1280` and `original`. The card slot uses `w780`.
- Chosen with the user in this session: `expo-linear-gradient` for the title gradient, over `react-native-svg` and a flat overlay; no automatic retries (`retry: false` on the query client), over TanStack's default of three or one retry for transient errors, so the error state shows at once and Retry is the recovery; and `region=US`.
- Decided by the agent, for review:
  - FlashList rows have no `keyExtractor`, so they're keyed by index. With `keyExtractor={(movie) => String(movie.id)}` the repeated-movie test passed without any de-duplication, because rows sharing a key collapsed into one and hid the repeat. Without it, a repeat renders twice, which is what the test now catches. The list only appends pages or starts over, so index keys cost nothing.
  - Pull-to-refresh calls `refetch()`, which for an infinite query refetches every loaded page in turn: one request per page. Cutting the cache back to its first page before refetching is the alternative.
  - A refresh that fails while movies are on screen keeps them and says nothing. A failed next page has its own footer with Retry. Ticket 04's offline banner is the natural place to say a refresh failed.
  - Rotating changes the column count, and FlashList 2.0.2 keeps the old row sizes when it does: on the Pixel 9 Pro emulator, portrait, landscape and portrait again left an extra gap between two cards. The list is keyed by its column count, so a new count starts a new list, and `initialScrollIndex` opens it at the first movie that was on screen. That movie is tracked with `onViewableItemsChanged`, reported at once instead of after FlashList's default 250 ms. On the emulator, after scrolling to "The Social Reckoning", rotating both ways kept it at the top. Jest can't see this, because a remounted FlashList renders every row there, so the rotation test only checks that the movies survive the switch to two columns.
  - A missing token now throws the `unauthorized` `TmdbError` from `readTmdbToken()`, as ticket 01 planned. The screen's message for it names `EXPO_PUBLIC_TMDB_TOKEN` in `.env`, so the setup hint isn't lost behind the friendly text.
  - The Retry button has ink text on sky blue, about 7:1 contrast. White text on that blue is about 2:1.
  - `WIDE_BREAKPOINT` is 600 dp, where Material's compact width class ends: phones in portrait get one column, phones in landscape, tablets and unfolded foldables get two. It lives in `src/lib/layout.ts` with the `useColumnCount()` hook.
  - Where things live: TMDb's JSON types in `src/api/tmdbTypes.ts` and the app types (`Movie`, `Paged`) in `src/api/types.ts`; the query key factory in `src/lib/queryKeys.ts`; the query client in `src/lib/queryClient.ts`; the message for each failure kind in `src/lib/errorMessage.ts`.
  - `npx expo install expo-image` added the `expo-image` config plugin to `app.json`. Cards pass `recyclingKey` so a recycled row doesn't flash the movie it held before.
- Test setup, all in `src/test/`:
  - FlashList 2.0.2's shipped `jestSetup.js` doesn't work: it replaces `FlashList` with a `RecyclerView` export the package no longer has, so the list renders as `undefined`. `setup.ts` mocks only FlashList's layout measurement instead, as FlashList's own tests do: a 400 x 900 window and 100-high rows.
  - Jest never exited after the tests: TanStack Query keeps a 5-minute garbage-collection timer for every unmounted query. `setup.ts` swaps in a timer provider whose timers are unref'd. Ticket 04's 7-day `gcTime` needs this too.
  - Updates from TanStack Query's timers and FlashList's layout passes sometimes landed after a test's last assertion and printed `not wrapped in act(...)`, in roughly one run in six. `setup.ts` now keeps `IS_REACT_ACT_ENVIRONMENT` off, as RNTL already does inside `findBy*` and `user.*`. 20 repeated runs printed nothing. Wrapping TanStack's scheduler in `act()` was tried first and failed 12 of the 13 tests.
  - Every test starts in a 390 x 844 window. React Native's Jest window is 750 wide, which counts as wide and would render two columns.
  - `src/test/window.ts` sets the phone-sized window and rotates it to landscape.
  - `src/test/tmdb.ts` holds the fake TMDb: `tmdbMovie()`, `fullPage()`, `serveUpcoming()` (with `hold` and `failPages` per page), `failUpcoming()`, `stallUpcoming()` and `gate()`. `src/test/pullToRefresh.ts` calls the list's `onRefresh` as the native pull would.
  - Mutation checks: with the scroll removed, the next-page test fails; with de-duplication removed, the repeated-movie test fails; with the AbortSignal dropped from `fetch`, the cancellation test fails.
  - Jest can't see columns, so the one- and two-column layouts are checked on devices, not in a test.
- Verified: `npm run check` passes (typecheck, lint with no warnings, 17 tests, no console output). On the iPhone 17 Pro simulator (iOS 26.5) and the Pixel 9 Pro emulator (API 35), with the project's real token:
  - Cards show the backdrop, the gradient and a Poppins title, and a card whose image is still loading shows navy. Scrolling to the end shows a placeholder card, then the next page. Pull-to-refresh shows the spinner and refetches without disturbing the layout.
  - Android landscape shows two columns inside the safe area, and the skeleton, error, empty and next-page-error states, forced onto the screen temporarily, look as designed.
  - iOS landscape was seen once in a screenshot after someone rotated the simulator, and it showed two columns. The rotation restore was checked on Android only, because `simctl` can't rotate a simulator. The iOS 18.5 simulator is still untested, as in ticket 01.
