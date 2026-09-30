# 09: Search results screen

**What to build:** Submitting a search opens a full Results screen (the Figma's screen 04) with the match count and every result, loading more as the user scrolls.

**Blocked by:** 08 (Search with live Top Results)

**Status:** resolved

- [x] Keyboard Go on a non-empty term opens Results for that query.
- [x] The header reads "N Results Found" from `total_results`; back returns to Search with the text intact.
- [x] Rows match Top Results; more pages load on scroll; tapping a row opens Movie Detail.
- [x] Results' route params can carry either a search query or, later, a genre (ticket 12).
- [x] Loading, empty, error and offline states match the rest of the app; results stay in memory only.
- [x] Behaviour tests: submitting shows the count and the first page; scrolling loads the next page; back keeps the search text.

## Decisions made while building

- One set of pages per term, read by both screens. The search for a term is now an infinite query under the same key as before, `['search', term]` (ADR-0001), and replaces ticket 08's single-page query. `useTopResults(term)` reads its first page, debounced as before. `useSearchResults(term)` reads every loaded page, each movie once, with the total. So Results opens with the page Top Results already has and sends no request for it. The rejected option was a second key for Results: the two screens would each ask TMDb for page 1 of the same term, and the count could disagree with the rows behind it.
- `useMovieSearch` is now `useTopResults`, in the same file, `src/hooks/useMovieSearch.ts`, beside `useSearchResults`.
- `searchMovies()` takes a page. `Paged` gains `totalResults`, mapped from `total_results` for every paged list by one mapper, `toMoviePage()`. An upcoming list saved before this ticket has pages without `totalResults`. Nothing reads it from the upcoming list, so the cache buster stays at 1.0.0, as in tickets 07 and 08.
- Route params: `Results: { kind: 'search'; text: string }`. `kind` tells the kinds of Results apart, so ticket 12 adds `{ kind: 'genre'; ... }` without changing the search one. `text` is the search as the user typed it, trimmed. Results normalizes it into the search term itself, and the no-match message shows it as typed, as Search's does.
- The keyboard's search key opens Results when the term is not empty. Text with only spaces does nothing. Results does not wait for the debounce: if the key is pressed before Search has asked TMDb, Results asks at once and Search reads the same answer.
- Header: a plain ink back chevron and "N Results Found", or "1 Result Found". Until TMDb answers, and in the error and offline states, the title is "Results", because there is no count yet. The count is the first page's `total_results`, so it does not change while the user scrolls.
- `BackButton` has two forms: a plain chevron for the header bar (the default), and `onImage` with the dark backing, which Movie detail uses. `ChevronLeft` takes `onDark`, as `Cross` does.
- The list is a FlashList in one column, and two above the wide breakpoint, keyed by the column count and opening at the first movie that was on screen, as Movie list does. Pages overlap, so a movie shows once (`moviesOnce()` in `src/lib/pages.ts`, which Movie list now shares, with `nextPageNumber()`).
- States, as on Movie list:
  - Loading: six skeleton rows, labelled "Loading results".
  - No match: "0 Results Found" and "No movies match '<text>'".
  - Error: "Couldn't search for movies" with Retry, centred, because no keyboard covers it here.
  - Offline with no results from earlier: the offline state, read from the query's `paused` state. Results has no debounce, so the query is paused from the start.
  - Offline with results from earlier: the results under the banner "You're offline. Showing results from earlier.", the same banner the user chose for Top Results in ticket 08.
  - Next page: one skeleton row below the movies while it loads, and "Couldn't load more results" with Retry when it fails.
- Results has no pull-to-refresh. The ticket does not ask for one.
- Results stay in memory only: they are the same cache entries as Top Results, and `search` is not a persisted root.
- Glossary: `CONTEXT.md` gains Results, and the Offline banner entry names it.
- Tests: `serveSearch()` takes one array per page for a query with several pages, and still one array of movies for a query with one. `letSearchSettle()` moved to `src/test/search.ts`, shared by the Search and Results tests. `ResultsScreen.test.tsx` has 15 tests. A screen below the top of the stack is hidden from RNTL's queries, so a Results test does not find Search's rows. The test for the spaces-only search key fails without its guard (checked by removing it).
- Verified: `npm run check` passes (typecheck, lint with no warnings, 131 tests). On the Pixel 9 Pro emulator (API 35): the keyboard's search key opens Results for "Dune" with "1111 Results Found" and the first page at once; scrolling loads more pages; back returns to Search with "Dune" in the field; landscape shows two columns at the same movie, and portrait again keeps the place; a row opens Movie detail and back returns to the same place; airplane mode shows the offline banner over the results, and a new term ("dunes") shows the offline state, then "42 Results Found" with no tap once the connection returns. On the iPhone 17 Pro simulator (iOS 26.5): Results for "Dune" with the header and rows (seen by temporarily starting the app on Results). Not checked: taps and scrolling on iOS, for the reason in ticket 08, and the iOS 18.5 simulator.
- An Enter key sent with `adb shell input keyevent 66` puts Android into keyboard navigation, which draws a grey focus square on the back button. A tap on the on-screen search key does not.

## Comments

**2026-09-30, context from ticket 08**

- Top Results caches the first page of a search under `['search', term]` as a `Paged<Movie>` (`useMovieSearch`). An infinite query for Results needs its own key or has to replace that one: the two shapes can't share a key.
- `searchMovies()` takes no page yet, and `Paged` has no total: Results needs both (`total_results`).
- Rows are `MovieRow`, with the genre name from `firstGenreName(movie, genres)` in `src/lib/genres.ts` and the list from `useGenres()`. `MovieRowsSkeleton` stands in for rows that are loading.
- The field's keyboard key already reads "search" (`returnKeyType`), with no `onSubmitEditing` yet.
- A test that opens Search must serve the genre list (`serveGenres()`), because Search asks for it on opening.
