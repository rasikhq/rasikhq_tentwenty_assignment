# 09: Search results screen

**What to build:** Submitting a search opens a full Results screen (the Figma's screen 04) with the match count and every result, loading more as the user scrolls.

**Blocked by:** 08 (Search with live Top Results)

**Status:** ready-for-agent

- [ ] Keyboard Go on a non-empty term opens Results for that query.
- [ ] The header reads "N Results Found" from `total_results`; back returns to Search with the text intact.
- [ ] Rows match Top Results; more pages load on scroll; tapping a row opens Movie Detail.
- [ ] Results' route params can carry either a search query or, later, a genre (ticket 12).
- [ ] Loading, empty, error and offline states match the rest of the app; results stay in memory only.
- [ ] Behaviour tests: submitting shows the count and the first page; scrolling loads the next page; back keeps the search text.

## Comments

**2026-09-30, context from ticket 08**

- Top Results caches the first page of a search under `['search', term]` as a `Paged<Movie>` (`useMovieSearch`). An infinite query for Results needs its own key or has to replace that one: the two shapes can't share a key.
- `searchMovies()` takes no page yet, and `Paged` has no total: Results needs both (`total_results`).
- Rows are `MovieRow`, with the genre name from `firstGenreName(movie, genres)` in `src/lib/genres.ts` and the list from `useGenres()`. `MovieRowsSkeleton` stands in for rows that are loading.
- The field's keyboard key already reads "search" (`returnKeyType`), with no `onSubmitEditing` yet.
- A test that opens Search must serve the genre list (`serveGenres()`), because Search asks for it on opening.
