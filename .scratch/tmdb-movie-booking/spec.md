# Spec: TMDb Movie Booking

Status: ready-for-agent

## Problem Statement

A moviegoer wants to see which movies are coming soon, learn enough about one to decide whether it's worth seeing (details, genres, a trailer), find a specific movie quickly, and get as far as choosing seats for a showtime. They expect this to feel instant, to keep working on a flaky or absent connection, to look right in portrait and landscape on any phone, and never to leave them on a blank, broken or dead-end screen.

## Solution

A React Native app (Expo SDK 55, TypeScript, New Architecture) for iOS 15.1+ and Android (target API 36) with four core screens and one browse extension:

- **Movie list**: the entry point. Upcoming movies from TMDb as large image cards, loading more on scroll, with pull-to-refresh, available offline from the last saved copy.
- **Movie detail**: opens instantly from the list's data and fills in details, genres, overview and an image strip. It offers **Watch Trailer** only when a trailer exists and **Get Tickets** only for a bookable movie.
- **Trailer**: a fullscreen screen that plays the movie's trailer automatically, returns to the detail on its own when the trailer ends, and can be left at any time.
- **Movie search**: shows genres to browse before typing, live "Top Results" while typing, and a full results screen on submit. The results shown always match the current input, never a query the user has moved past.
- **Seat map**: the seat map for a fixed mock showtime, with seat types, unavailable seats, a selection of up to 8 seats, a running total, zoom controls, and an honest end to the flow (no payment).

Visually it follows the provided Figma for these screens (Poppins, the Figma palette, the card and row layouts) and leaves out Figma extras that the brief gives no behaviour for.

## User Stories

### Movie list

1. As a moviegoer, I want to see upcoming movies as soon as I open the app, so that I can find something to watch.
2. As a moviegoer, I want each movie shown as a large card with its image and title, so that I can recognise films at a glance.
3. As a moviegoer, I want more movies to load as I scroll, so that I can browse the whole upcoming list without paging controls.
4. As a moviegoer, I want scrolling to stay smooth however far I go, so that the app feels fast.
5. As a moviegoer, I want to pull down to refresh the list, so that I can see the latest upcoming movies.
6. As a moviegoer, I want placeholder shapes while movies load, so that the screen never looks blank or jumps when content arrives.
7. As a moviegoer, I want a clear message with a Retry button when the list fails to load, so that I know what happened and can try again.
8. As a moviegoer, I want the list I saw last time to appear instantly when I reopen the app, so that I don't wait on the network.
9. As a moviegoer, I want to see the saved list when I'm offline, with a note that I'm offline, so that the app keeps working without a connection.
10. As a moviegoer, I want the list to refresh itself when I come back to the app or my connection returns, so that I don't look at stale data for long.
11. As a moviegoer, I want two columns of cards when the screen is wide, so that landscape space isn't wasted.
12. As a moviegoer, I want a search button in the header, so that I can look for a specific movie.

### Movie search

13. As a moviegoer, I want to see genres when I open search, so that I can browse before I know what to type.
14. As a moviegoer, I want each genre tile to show an image from a movie in that genre, so that the grid is inviting.
15. As a moviegoer, I want to tap a genre to see its movies, so that I can explore by taste.
16. As a moviegoer, I want results to appear as I type, so that search feels immediate.
17. As a moviegoer, I want the results on screen to always match what I've currently typed, so that I never act on results for an older query.
18. As a moviegoer, I want an indication while results for my latest text are loading, so that I know the app is working.
19. As a moviegoer, I want results for text I already searched to reappear instantly when I backspace, so that editing my query is fast.
20. As a moviegoer, I want each result to show a thumbnail, the title and a genre, so that I can tell similar titles apart.
21. As a moviegoer, I want to submit my search to see all results with a count, so that I know how many movies matched.
22. As a moviegoer, I want to keep scrolling through the full results, so that the count matches what I can actually reach.
23. As a moviegoer, I want a clear message when nothing matches my search, so that I know to try different words.
24. As a moviegoer, I want to be told that search needs a connection when I'm offline, while terms I searched earlier in the session still work, so that I understand why new searches fail.
25. As a moviegoer, I want to clear my search with one tap, and close search when the field is empty, so that I can start over or leave quickly.
26. As a moviegoer, I want to tap a result to open that movie, so that I can learn more about it.

### Movie detail

27. As a moviegoer, I want the movie's image and title to appear the moment I tap it, so that opening details feels instant.
28. As a moviegoer, I want to see the release date, genres and overview, so that I can decide whether to watch it.
29. As a moviegoer, I want genres shown as coloured chips, so that they're easy to scan.
30. As a moviegoer, I want a strip of images from the movie, so that I get a feel for it.
31. As a moviegoer, I want a Watch Trailer button only when a trailer exists, so that I never tap something that does nothing.
32. As a moviegoer, I want Get Tickets only for a bookable movie, so that I'm not offered tickets for old films.
33. As a moviegoer, I want older movies to say when they were released instead, so that the detail still makes sense for films found through search.
34. As a moviegoer, I want details I've opened before to show when I'm offline, so that I can revisit them without a connection.
35. As a moviegoer, I want the image beside the content when the screen is wide, so that I can read without scrolling past a huge image.
36. As a moviegoer, I want an error with Retry if details fail to load, so that I'm never stuck on a blank screen.

### Trailer

37. As a moviegoer, I want the trailer to open full screen and start playing on its own, so that I don't need extra taps.
38. As a moviegoer, I want to return to the movie automatically when the trailer ends, so that I don't have to close it.
39. As a moviegoer, I want to leave the trailer at any time with a close button or the Android back button, so that I'm always in control.
40. As a moviegoer, I want the trailer to fill the screen when I rotate to landscape, so that I can watch comfortably.
41. As a moviegoer, I want a clear message with Retry, Open in YouTube and Back if the trailer can't play in the app, so that I'm never stuck.

### Seat map

42. As a moviegoer, I want Get Tickets to open the seat map for a showtime, so that I can pick where to sit.
43. As a moviegoer, I want the header to show the movie, date, time and hall, so that I know which showtime I'm choosing seats for.
44. As a moviegoer, I want to see where the screen is and which row is which, so that I can judge the view from each seat.
45. As a moviegoer, I want Regular, VIP, unavailable and selected seats in distinct colours with a legend, so that I understand the map.
46. As a moviegoer, I want to tap a seat to select it and tap it again to deselect it, so that choosing is simple.
47. As a moviegoer, I want an unavailable seat to ignore my taps, so that I can't pick a seat someone else already has.
48. As a moviegoer, I want to pick up to 8 seats and get a brief message if I try for more, without the layout jumping, so that the limit is clear and unobtrusive.
49. As a moviegoer, I want my selection listed as chips I can remove, so that I can review and adjust it.
50. As a moviegoer, I want the total price to update as my selection changes, so that I know what I'd pay.
51. As a moviegoer, I want to zoom in and out with buttons, so that I can tap small seats accurately on any screen.
52. As a moviegoer, I want zooming to keep the part of the hall I'm looking at in view, so that I don't lose my place.
53. As a moviegoer, I want seats to stay sharp at every zoom level, so that the map looks polished.
54. As a moviegoer, I want the seat map to keep the same layout in landscape, with the hall using the available height, so that the screen stays familiar and usable.
55. As a moviegoer, I want Proceed to pay disabled until my selection has a seat, so that I can't continue with nothing chosen.
56. As a moviegoer, I want Proceed to pay to show a summary that says payment isn't part of this demo, so that the flow ends honestly instead of pretending to book.
57. As a moviegoer, I want the same showtime to show the same unavailable seats every time, so that the map doesn't reshuffle when I come back.
58. As a moviegoer, I want my selection cleared when I leave the seat map, so that a later visit starts fresh.

### Accessibility

59. As a screen reader user, I want every seat to announce its row, number, seat type, price and availability, so that I can choose seats without seeing the map.
60. As a screen reader user, I want selected seats announced as selected, so that I know my choices.
61. As a screen reader user, I want cards, buttons, chips, genre tiles and zoom controls labelled, so that every control is usable.

### Developer and reviewer

62. As a developer, I want to supply the TMDb token through an environment variable, so that the key never enters the repository.
63. As a developer, I want typecheck, lint and tests behind one command that also runs in CI, so that broken commits are caught.
64. As a reviewer, I want an installable APK, so that I can run the app without building it.
65. As a reviewer, I want the README to explain setup, the libraries chosen and why, and the scope decisions, so that I can follow the reasoning.

## Implementation Decisions

### Platform and stack

- Expo SDK 55 (React Native 0.83), TypeScript in strict mode, New Architecture (mandatory in SDK 55). iOS 15.1+ and Android minSdk 24 / targetSdk 36. See ADR-0002 for why SDK 55 and not a newer SDK or bare React Native.
- Development builds, not Expo Go. Continuous Native Generation: the native projects are generated by prebuild and gitignored; native configuration lives in the app config and config plugins.
- Library versions come from SDK 55's pinned set (`npx expo install`), not npm `latest`. `msw` is pinned to 2.x, because 3.0 is ESM-only and removed its React Native entry point.
- Android edge-to-edge is always on at target API 36, so every screen respects safe-area insets.
- Both orientations are supported on every screen. Layout decisions use width breakpoints from the window size, not an orientation flag, so tablets and split view behave too.

### Code organisation

- Layer-first folders: screens, components, hooks, the API module, shared library code, and static data. The one hard boundary: only the API module knows TMDb's JSON shapes. It maps TMDb responses into app types (movie, movie detail, trailer, genre, image, paged result), and screens and components import app types only. An ESLint import restriction enforces the boundary.
- Pure rules live in plain functions with no React or network dependencies: trailer pick, bookable movie, showtime for a movie, search term normalization, hall layout to numbered seats, and unavailable seats for a showtime.

### TMDb API contract

- Base URL `https://api.themoviedb.org/3`, authenticated with the v4 Read Access Token as a Bearer header, read from `EXPO_PUBLIC_TMDB_TOKEN`. A `.env.example` is committed and `.env` is gitignored. The README states that the token ships inside the app bundle and that a production app would call TMDb through its own backend.
- Endpoints:
  - `GET /movie/upcoming?page=n` for the movie list.
  - `GET /movie/{id}?append_to_response=videos,images` for the detail, fetching the brief's detail, videos and images endpoints in one request. It includes `include_image_language=en,null`, so language-neutral images aren't filtered out.
  - `GET /search/movie?query=<term>&page=n` for search.
  - `GET /genre/movie/list` for genre names and tiles.
  - `GET /discover/movie?with_genres=<id>&page=n` for a genre's movies.
- Images come from `https://image.tmdb.org/t/p/{size}/{file_path}`, with a size chosen per slot (thumbnail, card, hero, strip) rather than `original`.
- The API client passes the query's `AbortSignal` to every request and turns failures into typed errors: token missing or invalid, not found, rate limited, offline or network failure, and server error. Screens map these to messages.
- To verify against real responses during the movie list work: whether upcoming pages repeat movies (if they do, flattening de-duplicates by movie id), whether a region parameter is needed, and whether the upcoming list contains past release dates.

### Server state, caching and offline (ADR-0003)

- TanStack Query owns all server state. UI state (search text, selection, zoom level) is React component state. There is no global store.
- Query keys come from one central factory, so keys and invalidation stay consistent.
- The query cache is persisted to AsyncStorage with a 7-day max age, and `gcTime` is set at least that long. The persister's cache-buster is tied to the app version, so a change to the cached data shape discards old caches instead of misreading them.
- Only these are persisted: the first 3 pages of the upcoming list, the details of movies the user has opened, and the genre list. Search results and genre results stay in memory only.
- Data counts as stale after: 1 hour for the list, 24 hours for a detail, 7 days for genres.
- Queries refetch when the app returns to the foreground (focus manager wired to AppState), when the connection returns (online manager wired to NetInfo), and on pull-to-refresh on the list.
- Offline UI: a slim banner when a screen is showing saved data, and a full offline state with Retry only when nothing is saved. There are no writes, so there is no offline queue.

### Navigation (ADR-0004)

- React Navigation 7 native stack, one root stack with a typed param list: Movie List (initial), Search, Results, Movie Detail, Trailer (fullscreen modal), Seat Map.
- There is no tab navigator and no bottom tab bar. The Figma's tab bar has no behaviour in the brief.

### Styling

- NativeWind. The design values live in the Tailwind config: the Figma palette (dark navy, off-white, grey, sky blue, light grey, teal, pink, purple, gold), a spacing scale, and Poppins with one font family per weight (Android can't synthesize weights for custom fonts).
- A small set of primitives (text variants, button variants, screen, chip, skeleton, error state, empty state, offline banner, toast) own the class strings, so screens compose primitives rather than long class lists. Values that must be calculated (seat size under zoom, widths from the window size) use inline styles.
- Light theme only.
- Poppins is embedded at build time with the expo-font config plugin, so there's no flash while fonts load.
- Images use expo-image with memory and disk cache, so posters seen once still show offline.
- NativeWind's compatibility with SDK 55 is verified at scaffold by building. If it fails, the fallback is `StyleSheet` with the same design values.

### Screen states (every screen)

- Loading: skeleton blocks shaped like the final layout, with a gentle pulse from React Native's Animated API. Content loads never use spinners.
- Empty: specific text for each case, for example "No movies match 'xyz'".
- Error: a message plus Retry. The offline banner and offline state follow the caching rules above.

### Movie list

- Header: "Watch" and a search button, as in the Figma. Cards show the backdrop image with the title over a darkening gradient.
- FlashList with infinite loading of upcoming pages. One column below the wide breakpoint, two above it.

### Movie search

- Search field placeholder: "Search movies". The Figma's "TV shows, movies and more" would promise TV results the app doesn't have.
- The field isn't auto-focused, so the genre grid is fully visible on open, as in the Figma.
- The field's clear button clears the text when there is text, and closes search when the field is empty. Its accessibility label changes to match.
- Idle state (empty input): the genre grid, 2 columns below the wide breakpoint and 4 above.
  - Tiles come from the genre list.
  - A tile's image is the backdrop of a cached upcoming movie in that genre (no extra requests). A genre with no match gets a solid tile in a palette colour.
  - Tapping a tile opens Results for that genre.
- Typing: live "Top Results" rows (thumbnail, title, first genre name), first page only. There's no "…" menu on rows.
- Freshness (ADR-0001):
  - Terms are normalized (trimmed, lowercased, spaces collapsed).
  - Requests are debounced by about 300 ms, keyed by the normalized term, and cancelled through `AbortSignal` when overtaken.
  - Results render only when their term equals the current normalized input; otherwise a searching row shows. A term that's already cached shows instantly.
  - `keepPreviousData` is not used.
- Submitting (keyboard Go) opens Results for the query.

### Results

- One screen serves both a search query and a genre, and it's the Figma's screen 04.
- Header: "N Results Found" from `total_results` for a search, and the genre name for a genre. The back button returns to search with the text intact.
- Rows are the same as Top Results, loading more pages on scroll.

### Movie detail

- Opens with the list item (or result row) data as placeholder data, so the image and title render on tap while the full detail loads.
- Content:
  - The image, the title, and either "In Theaters <date>" (bookable movie) or "Released <date>" (otherwise).
  - Get Tickets (bookable movie only) and Watch Trailer (only when a trailer exists).
  - Genre chips, coloured by cycling teal, pink, purple and gold.
  - The overview.
  - A strip of backdrop images, hidden when there are none.
- Dates are formatted like "December 22, 2021".
- Layout: the image on top in portrait. Above the wide breakpoint, the image takes the left half and the content scrolls on the right. A transparent header over the image holds the back button.
- **Trailer rule:** the official YouTube video with type "Trailer", otherwise the official YouTube "Teaser". Otherwise the movie has no trailer.
- **Bookable movie rule:** the release date is in the future or within the last 60 days. A movie with no release date is not bookable.

### Trailer

- A fullscreen modal screen that follows device rotation.
- The official YouTube embed (IFrame Player API) runs inside a WebView behind our own trailer player component. The component takes the video key and reports ended and error events. It is the test seam described below.
- Behaviour:
  - It autoplays on open.
  - When the trailer ends, it returns to the detail on its own.
  - A close button and Android back leave at any time.
  - An error, an embed that isn't allowed, or being offline shows an error state with Retry, Open in YouTube and Back.
- The player's implementation is decided by the trailer prototype. It weighs `react-native-youtube-iframe` (no release in about 15 months, an open play/pause bug, and a default player page hosted on the maintainer's GitHub Pages) against a thin wrapper of our own over `react-native-webview`. The prototype also settles autoplay behaviour on both platforms.

### Seat map

- **Entry:** Get Tickets opens the seat map directly for a fixed mock showtime. The date is the later of today and the release date, at 12:30, in Hall 1. The header shows the movie title and "<date> | 12:30 Hall 1".
- **Data model:**
  - The layout belongs to a hall. A hall's rows are lists of segments, where each segment is either a run of seats of one seat type or a gap (aisle or empty space). Seats are numbered within their row, and gaps are skipped.
  - A showtime points to a movie, a hall and a start time.
  - Unavailable seats belong to the showtime. They're generated deterministically from the showtime's identity, roughly a third of seats, with nothing saved.
  - There's one hall today, and the model takes more halls as data only.
- **Hall 1** mirrors the Figma's hall: 10 numbered rows, three blocks split by two aisles, shorter front rows, row 10 VIP, and a "SCREEN" arc above row 1.
- **Seat types and prices:** Regular $50 (sky blue) and VIP $150 (purple). An unavailable seat is light grey and not pressable. A selected seat is gold. The legend reads Selected, Not available, VIP ($150) and Regular ($50).
- **Selection:**
  - A tap toggles an available seat. The maximum is 8 seats; a ninth tap changes nothing and shows a toast.
  - The toast is an overlay that fades out and never shifts the layout.
  - Selected seats show as chips ("<seat> / <row> row" with a remove button) in a fixed-height row that scrolls sideways.
  - The total is the sum of the selected seats' prices.
  - Leaving the screen clears the selection. There's no confirmation on leaving.
- **Proceed to pay:** disabled while the selection is empty. Pressing it shows a lightweight summary (the seats and the total) stating that payment isn't part of this demo. The user stays on the seat map.
- **Zoom:**
  - The + and − buttons step through levels relative to the measured width of the hall area: fit to width, then 1.5× and 2.25× of fit. Seat size is capped at a comfortable maximum. The buttons disable at the ends.
  - The hall scrolls in both directions and starts at fit.
  - Changing the zoom keeps the visible centre in place.
  - Zoom re-lays out seats at the new size and never scales with transforms, so seats stay sharp.
- **Rendering:** one memoized seat view per seat (about 200), so a selection change re-renders only the seats that changed.
- **Layout:** the same order in both orientations: header, hall, legend, then chips, total and button. The hall takes all the leftover height and the page itself doesn't scroll.
  - Above the wide breakpoint (and in phone landscape), the legend compacts to one row, and the chips, total and button share one bottom row.
- **Accessibility:** each seat is labelled, for example "Row 3, seat 4, Regular, 50 dollars, available", and exposes its selected state. An unavailable seat is announced as unavailable and disabled.

### Tooling and delivery

- One `npm run check` script runs the typecheck, lint and tests. A CLAUDE.md rule requires it before every commit.
- A GitHub Actions workflow runs `npm run check` on push, on pull request, and manually.
- Android release APK built locally from the generated project and signed with the debug keystore. It's installable for reviewers but not for a store, and no keystore is committed.
- An iOS simulator build is zipped into the demo folder if time allows.

## Testing Decisions

- **What a good test is:** it drives the app the way a user does (press, type, scroll) and asserts on what the user perceives (visible text, accessibility roles, labels and states). It never asserts on implementation details (hook calls, internal state, component structure), and there are no snapshot tests. Tests are named in the glossary's language.
- **The main seam: the HTTP boundary, with the whole app rendered.**
  - One render helper mounts the production provider tree (query client with persistence, safe-area provider) and the real root navigator, optionally starting at any route with params.
  - MSW 2 (`msw/node`) answers the TMDb endpoints.
  - Everything between the screen and the network runs for real: API client, mappers, query hooks, cache and navigation.
  - Fixture builders for TMDb responses let each test state only the fields it cares about.
- **Fakes for things Jest doesn't have:**
  - **Connectivity:** NetInfo's official Jest mock, switched between offline and online. Failed requests come from MSW network errors.
  - **Disk:** AsyncStorage's official in-memory Jest mock. A test "restarts" the app by unmounting and rendering again, so the cache restores from storage.
  - **Trailer player:** our own trailer player component, replaced by a fake that fires the ended and error events. The real embed is verified on devices and in the prototype.
  - **Clock:** Jest's system time, for the bookable movie rule and the showtime date.
- **Direct unit tests, only for rules with many cases:** trailer pick, bookable movie, hall layout to numbered seats, and search term normalization.
- **Behaviours the suite must prove, at minimum:**
  - Search never shows results for a term the user has moved past, even when the older request resolves last.
  - An empty search shows the no-match message.
  - Offline search shows the needs-a-connection state.
  - The list shows saved movies and the offline banner when offline after a restart.
  - The list error state's Retry recovers.
  - The detail renders the placeholder image and title before the full detail arrives.
  - Watch Trailer is hidden when no trailer exists.
  - Get Tickets appears for a bookable movie and "Released <date>" for an old one.
  - The trailer screen returns to the detail when the trailer ends, and shows its error state with Open in YouTube on error.
  - The seat map toggles seats, ignores unavailable seats, caps the selection at 8 with a toast, updates the chips and total, and keeps Proceed to pay disabled with an empty selection.
- **Prior art:** none yet, since this is a greenfield repo. The first screen test sets the pattern (render helper, MSW handlers per endpoint, fixture builders) that later tests follow.
- **Tooling:** Jest with the `jest-expo` preset and React Native Testing Library 14, whose render and events are async and awaited.
- **Optional, last:** one Maestro end-to-end smoke flow on a device (list, detail, seat map).

## Out of Scope

- Payment, real booking, reservations, and saving a selection anywhere.
- A showtime picker (the Figma's date and showtime screen). This is a stretch ticket, done last and only if time allows. Until then there's one fixed mock showtime and one hall.
- The bottom tab bar and the "…" menu on search rows from the Figma.
- Accounts, sign-in, favourites and watchlists.
- A dark theme, deep links, push notifications, and localization (English only).
- TV shows and people in search.
- Pinch-to-zoom on the seat map, and the title logo over the detail image. Both are polish tickets if time allows.
- Seat rules beyond the 8-seat limit (for example orphan-seat rules) and a confirmation when leaving with seats selected.
- An offline write queue (the app never writes to TMDb).

## Further Notes

- **Decisions recorded as ADRs:**
  - 0001: search results are keyed by term.
  - 0002: Expo SDK 55, keeping both Expo and iOS 15.
  - 0003: server state in TanStack Query, persisted for offline use.
  - 0004: React Navigation instead of expo-router.
- Domain vocabulary is in `CONTEXT.md`. Steers from planning are in the steering log.
- **Order of work:** the four brief screens first (list, detail with trailer, search with results, seat map), then genre browsing (first to cut if time runs short), then the stretch and polish tickets.
- The trailer prototype runs before the trailer ticket and decides the player implementation. Its findings feed back into that ticket.
- **Scale (10× the data):**
  - The persister writing the whole cache as one value is the first thing to strain. The path then is per-query persistence on MMKV.
  - At stadium-sized halls, individual seat views get heavy, and a Skia canvas becomes the right rendering approach.
  - Search results already stay out of persistence, so their growth is bounded by the session.
- The iOS floor is 15.1, the real floor React Native and Expo set. Testing covers the installed iOS 18.5 and 26.5 simulators and a Pixel 9 Pro emulator, and the README states that.
- **Submission deliverables:**
  - A public repo named `<name>_tentwenty_assignment` with the README, source and a demo folder.
  - A demo screen recording and the installable APK.
  - An optional code walkthrough video.
  - The candidate's own short decision note.
