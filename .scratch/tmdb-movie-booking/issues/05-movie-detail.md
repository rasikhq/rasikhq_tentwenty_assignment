# 05: Movie detail

**What to build:** Tapping a movie opens its detail instantly (image and title from the list's data) and fills in the rest from one request: the release line, genre chips, overview and an image strip. Details the user has opened stay available offline.

**Blocked by:** 04 (Offline movie list)

**Status:** resolved

- [x] The detail loads from `/movie/{id}` with videos and images appended in the same request (and `include_image_language=en,null`), mapped into an app movie detail type.
- [x] The tapped movie's list data seeds the detail as placeholder data, so the image and title render immediately.
- [x] The release line reads "In Theaters <date>" for a bookable movie (release date in the future or within the last 60 days) and "Released <date>" otherwise; a movie with no release date is not bookable. Dates read like "December 22, 2021".
- [x] Genre chips cycle teal, pink, purple and gold; the overview follows; a strip of backdrop images sits under it and is hidden when there are none.
- [x] Portrait: image on top. Above the wide breakpoint: the image takes the left half and the content scrolls on the right. A transparent header over the image holds the back button.
- [x] Skeleton sections while loading; an error with Retry; opened details persist (stale after 24 hours) and show offline.
- [x] No Get Tickets or Watch Trailer button yet (tickets 10 and 07 add them), so nothing on the screen is dead.
- [x] Unit tests for the bookable movie rule, with the clock set through Jest system time.
- [x] Behaviour tests: the placeholder title shows before the detail arrives; genres and overview render; an old movie shows "Released <date>"; an opened detail shows offline after a restart.

## Decisions made while building

- The tapped movie seeds the detail through the `MovieDetail` route param (`{ movie: Movie }`), not TanStack Query's `placeholderData`. The hero shows `detail ?? movie` in every state. Query placeholder data applies only while a query is pending, so in the error and offline states, where the screen still has to show the image and title, it would have left the hero empty. Search results and genre browsing will pass the same `Movie`.
- The hero asks for the `hero` size (w1280) and shows the list card's w780 image as its `placeholder`, which the list has already put in the disk cache, so the image is there on the first frame. The strip uses `strip` (w500).
- `/movie/{id}` is requested with `append_to_response=videos,images` and `include_image_language=en,null`. The app reads only the images for now: `TmdbMovieDetail` leaves `videos` out until ticket 07 needs it. The fake TMDb (`serveMovieDetail`) answers 400 to a request without those parameters, so every test that shows a detail also proves they were sent.
- The strip lists every backdrop TMDb returns in a `FlatList`, which renders only what is near the screen, so the list needs no cap. A movie with no release date shows no release line, rather than a line with nothing to say.
- Dates go through `src/lib/dates.ts`, which counts calendar days from the date's year, month and day. The bookable movie rule is `isBookable()` in `src/lib/bookable.ts`: today is bookable, 60 days ago is bookable, 61 is not. The unit tests set the clock with `controlDate()` and `jest.setSystemTime()`. Dates are counted as UTC day numbers, so daylight saving changes cannot move a boundary.
- The behaviour tests use 2099 and 2021 release dates and leave the clock alone. A test that sets the date months away from the real one makes the persister's write throttle compute a delay over 2^31 ms, and Node prints a `TimeoutOverflowWarning` for each of the hundreds of writes (harmless, but noisy). The list's offline tests move the clock by hours and days, which stays inside the range.
- Chip text colour depends on the chip: ink on teal, pink and gold (7.3:1, 4.6:1 and 5.6:1), white on purple (7.1:1). White on teal, pink or gold would be 1.9:1, 3.0:1 and 2.5:1. The colour cycle itself isn't tested: Jest has no CSS step, so it is checked on the devices.
- Review found that dating the whole saved copy by its oldest query, as ticket 04 did, breaks once details are saved: a detail opened on day 0 made the restore on day 7 discard a list refreshed on day 6. `createPersistOptions()` now wraps `restoreClient` in `withoutExpiredQueries()`, so each saved query expires on its own age, and the copy is dated by its last write. A test covers a week-old detail beside a fresher list.
- Review also extracted `Scrim` (the gradient shared by `MovieCard` and `MovieHero`) and `OfflineState` (the offline message and its Retry, shared by Movie List and Movie detail); named the query key roots in `queryKeyRoots`; mapped genres field by field in the API module; and made the within-the-day test count requests, since a negative text assertion could pass before a slow refetch landed. The hero's title clears a display cutout beside it (`pl-safe`), which was not checked on a device.
- Persistence: `shouldPersist` (`src/lib/queryClient.ts`) now also accepts `movieDetail` queries, so every detail the user has opened is saved for 7 days and counts as stale after 24 hours (`staleTime` in `useMovieDetail`). `serializeData` sees only a query's data, not its key, so `trimForDisk` now trims only data shaped like an infinite query and passes anything else through.
- `OfflineBanner` takes its message: "You're offline. Showing saved movies." on Movie List, "You're offline. Showing saved details." on Movie detail. Offline with no saved detail shows "You're offline" with Retry in the content area, under the image and title, which use the seed.
- Movie cards are now `Pressable`s with the button role, and Movie List navigates with the `Movie` it holds. Detail tests open a movie by tapping its card: Jest keeps Movie List mounted under the detail, so the hero's title is found as a `header` and the card as a `button`.
- `expo-image` ignores `className` (NativeWind wraps only React Native's own components), which left the strip's images 0 by 0 pixels on the first device run. Images take `style={StyleSheet.absoluteFill}` inside a sized `View`, as `MovieCard` does.
- Status bar: light in portrait, where the image runs under it, dark above the wide breakpoint. There the two halves start below the status bar (`pt-safe`), because an Android clock over the dark image was unreadable.
- New in `src/test/tmdb.ts`: `tmdbMovieDetail()` and `serveMovieDetail()` (with `hold` and `fail`). The handler matches one movie id, since `/movie/:id` would also match `/movie/upcoming`.
- Verified: `npm run check` passes (typecheck, lint with no warnings, 59 tests). On the iPhone 17 Pro simulator (iOS 26.5): tapping a card opens the detail with the image and title, chips cycle teal, pink and purple, the strip scrolls, the back button returns to the list. On the Pixel 9 Pro emulator (API 35): the skeleton, the strip, and landscape with the image on the left half and the content on the right, all inside the safe area. The offline states are covered by tests only, not seen on a device. iOS landscape and the iOS 18.5 simulator are still unchecked, as in ticket 04.
