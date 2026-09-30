# 08: Search with live Top Results

**What to build:** Movie List's search button opens Search, where results appear as the user types and always match what's currently in the field, never an older query (ADR-0001). Tapping a result opens the movie's detail.

**Blocked by:** 05 (Movie detail)

**Status:** resolved

- [x] Movie List's header gains a search button that opens Search.
- [x] The search field's placeholder reads "Search movies" and it isn't auto-focused. Its button clears the text when there is text and closes Search when the field is empty, with matching accessibility labels.
- [x] Before any typing, Search shows a simple prompt (ticket 12 replaces it with the genre grid).
- [x] Terms are normalized (trimmed, lowercased, spaces collapsed). Requests are debounced by about 300 ms, keyed by the normalized term, and cancelled through `AbortSignal` when overtaken. `keepPreviousData` is not used.
- [x] Results render only when their term equals the current normalized input; otherwise a searching row shows. A term that's already cached shows instantly, for example on backspace.
- [x] "Top Results" rows show a thumbnail, the title and the first genre name, from the first page only, with no "…" menu. Genre names come from the genre list, fetched once, stale after 7 days, and persisted.
- [x] No match shows "No movies match '<term>'". Offline with an uncached term shows a needs-a-connection state, while terms searched earlier in the session still show. Search results are never persisted.
- [x] Tapping a row opens Movie Detail with the row's data as placeholder data.
- [x] Unit tests for term normalization.
- [x] Behaviour tests: when an older request resolves last, its results never show; the no-match message; the offline state; a row opens the detail.

## Decisions made while building

- Freshness follows ADR-0001. `useMovieSearch(term)` keys its query by the normalized term the screen has now, `['search', term]`, so the data it returns can only be that term's. `keepPreviousData` is not used. The debounce (300 ms, `useDebouncedValue`) only holds back the request: the query is `enabled` once the term has stayed the same for 300 ms. Because the key is the live term and not the debounced one, a term that is already cached shows its results on the keystroke, with no pause.
- Cancellation is TanStack Query's own. The query function reads the `signal`, so when the term changes and the old term's query has no observer left, TanStack aborts its request.
- Search results count as fresh for 1 hour, like the list. The spec gives no stale time for them. Within the hour, returning to a term sends no request. They live in memory only: `search` is not in the persisted query roots.
- Term normalization is `normalizeSearchTerm()` in `src/lib/searchTerm.ts`, with unit tests. The normalized term is what TMDb is asked for, so "Dune" and " dune " share one request and one cache entry.
- The no-match message shows the text as the user typed it, trimmed: "No movies match 'Xyzzy'", not the lowercased term. It reads as the user's own words.
- The "searching row" is a skeleton of three result rows labelled "Searching" for screen readers, because the spec says content loads never use spinners.
- Offline is read from the connection (`useIsOnline`), not from the query's `paused` state as the list and detail do. During the debounce the query hasn't started, so it isn't paused yet, and waiting would flash the searching row first. A term with results still shows them offline. When the connection returns, the waiting search runs with no tap.
- Search's empty, offline and error states all sit at the top of the screen (`inline`), not centred, so the keyboard doesn't cover them.
- A failed search shows "Couldn't search for movies" with Retry. The ticket doesn't list it, but every screen has an error state.
- Movies in list responses now carry `genreIds` (`TmdbMovie.genre_ids`). A movie detail has its genres in full and no `genreIds`, so `MovieDetail` is `Omit<Movie, 'genreIds'>` plus the detail fields. An upcoming list saved before this ticket has movies without `genreIds`. Nothing reads it from a saved list yet, and the app has not shipped, so the cache buster stays at 1.0.0. Ticket 12 will read `genreIds` from the cached upcoming list and must allow for a saved movie without it, or bump the version.
- The genre list (`useGenres`, `/genre/movie/list`) is asked for when Search opens, is stale after 7 days and is persisted. If it hasn't arrived or can't be loaded, rows show without a genre and nothing else changes: a missing genre name is not worth an error state.
- A row's thumbnail is the movie's backdrop at TMDb's `w300`, in the Figma's 130 x 100 box, with the navy placeholder when there is no backdrop. On a 3x screen `w300` is slightly under the box's 390 px; the next size up is `w780`, which is more than twice the download for each of 20 rows.
- A row's accessibility label is "title, genre", so two movies with the same title read differently.
- Top Results is a FlashList in one column, and two above the wide breakpoint, like Movie list. The list is keyed by column count and term, so a new term opens at its first result.
- Tapping a row puts the keyboard away before opening Movie detail. On Android the field kept its focus and the keyboard stayed up over the detail.
- `Screen` now takes a `header` slot instead of a `title`: Movie list passes the "Watch" title and the search button, Search passes the search field.
- Icons are drawn from views and no icon library was added, because the app has three icons. After the first commit the user steered every icon into its own component under `src/components/icons/` (see the steering log): `Magnifier`, `Cross` (ink, or white with `onDark`) and `ChevronLeft`. The search field and the trailer's close button share `Cross`, which makes the field's cross 20 wide where it was 16, and the back button uses `ChevronLeft`.
- The field's keyboard key reads "search" and does nothing yet: ticket 09 opens Results from it.
- The idle prompt is "Find a movie / Search for a movie by its title." until ticket 12 replaces it with the genre grid.
- Glossary: `CONTEXT.md` gains Search, Search term, Top Results and Genre list.
- Tests: `src/test/tmdb.ts` gains `serveSearch()` (results per query, with `hold` and `fail` per query; it records the queries that came in and those the app cancelled) and `serveGenres()`. `SearchScreen.test.tsx` serves an empty genre list before every test, because Search asks for it on opening. The test "when TMDb answers an older search term last, its results never show" passes by construction and also because the older request is aborted, so it can't be made to fail by removing one safeguard. The test "a searching row shows instead of the previous results" does fail when previous data is kept (checked by adding `placeholderData` temporarily). The two persistence tests fail when the persisted roots are swapped (also checked).
- Known limit: for a frame or two after a keystroke, the native field already shows the new text while React still shows the previous term's state. This is how React Native's text input works and is not a late network answer.
- Verified: `npm run check` passes (typecheck, lint with no warnings, 115 tests). On the Pixel 9 Pro emulator (API 35): the search button opens Search with the field unfocused; typing "Dune" shows the searching skeleton, then Top Results with thumbnails and genre names; a row opens Movie detail with its title at once; back returns to Search with the text intact; the cross clears the text; a nonsense term shows the no-match message; in airplane mode a new term shows the offline state and backspacing to "Dune" shows its results; turning airplane mode off runs the waiting search; landscape shows two columns. On the iPhone 17 Pro simulator (iOS 26.5): the Movie list header with the search button, Search's idle state, and Top Results for "Dune" (seen by temporarily starting the app on Search with that text). Not checked: typing and tapping on iOS, because the simulator tool's taps were delivered late or at the previous position in this session, and the iOS 18.5 simulator.
