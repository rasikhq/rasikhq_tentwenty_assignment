# 12: Genre browse

**What to build:** Before typing, Search shows a grid of genres (the Figma's screen 02), each tile with an image from a movie in that genre, and tapping a genre opens Results for it. This is the first ticket to cut if time runs short.

**Blocked by:** 09 (Search results screen). Start only after 07 and 11 (priority: the four brief screens come first).

**Status:** resolved

- [x] Search's idle state shows the genre grid from the genre list: 2 columns below the wide breakpoint, 4 above.
- [x] A tile's image is the backdrop of a cached upcoming movie in that genre (no extra requests); a genre with no match gets a solid palette-colour tile.
- [x] Tapping a tile opens Results for that genre from `/discover/movie?with_genres=<id>`, with the genre name as the header and more pages on scroll.
- [x] Genre results stay in memory only; offline, a genre not browsed this session shows the needs-a-connection state.
- [x] Tiles are labelled for screen readers.
- [x] Behaviour tests: the grid lists genres; a genre without a cached movie falls back to a colour tile; tapping a genre shows its movies.

## Decisions made while building

- The genre grid is what Search shows while the field is empty. It replaces the "Find a movie" prompt. `GenreBrowse` in `SearchScreen.tsx` reads the genre list (`useGenres()`, already fetched and saved since ticket 08) and shows the grid, or where the genre list stands:
  - Loading: placeholder tiles, labelled "Loading genres".
  - Failed: "Couldn't load genres" with Retry.
  - Offline with no saved genre list (a first run offline, or a saved copy more than 7 days old): "You're offline. Connect to the internet to browse genres." with Retry. The grid shows by itself once the connection is back.
  - TMDb lists no genres: the old "Find a movie" prompt. TMDb has genres, so this is only there so the screen is never blank.
- Offline with a saved genre list, the grid shows with no offline banner. The genre list is not what the user came to read, and a tile that can't load says so on Results.
- The grid is a `ScrollView` with wrapping tiles, not a FlashList. TMDb has 19 genres, so there is nothing to recycle. Two columns below the wide breakpoint and four above it (`useGenreColumnCount()` in `src/lib/layout.ts`). A tile is 100 dp high with 10 dp between tiles and 20 dp at the sides, as the rows of Top Results have.
- A tile's image comes from the upcoming movies the app already holds: `useLoadedUpcomingMovies()` reads the upcoming query with `enabled: false`, so Search never asks TMDb for upcoming movies. It still follows the query, so a list that arrives after Search opened gives the tiles their images. Opened from Movie list, the movies are the pages loaded there. After a restart they are the saved pages.
- Which movie a tile shows is `genreTiles(genres, movies)` in `src/lib/genreTiles.ts`:
  - A tile shows the first upcoming movie in its genre that has a backdrop and that no other tile shows.
  - The genre with the fewest movies picks first. With first-match, the movie at the top of the list (often Action, Adventure and Science Fiction at once) was the image of three tiles in the first two rows.
  - A genre whose movies are all shown by other tiles shares one. It has a match, so it gets an image, as the spec says.
  - A genre with no upcoming movie gets no image.
  - A saved movie from before ticket 08 has no `genreIds`. It counts as being in no genre. The cache buster stays at 1.0.0.
- The image is the `card` size (w780), the file a Movie list card shows. A backdrop the user has seen on Movie list is already on the device, so its tile shows at once and offline. The rejected option was a smaller size of its own (w500), which would download every tile's image again.
- A tile with no image is a palette colour, cycling teal, pink, purple and gold by the tile's place in the grid, as chips do. Every tile has the darkening gradient and a white name, so tiles with and without an image read the same, and white on teal or gold stays readable over the gradient's dark end. The colour also shows while an image loads.
- Tiles are buttons labelled with the genre's name. The image is hidden from screen readers.
- Results: the route params are now `{ kind: 'search'; text } | { kind: 'genre'; genre }`. `ResultsScreen` picks `SearchResults` or `GenreResults` by `kind`. Each reads its movies with its own hook and passes them to one `ResultsView`, with its own title and wording. The rejected option was one hook for both kinds: the two queries have different keys and data, and a hook can't be chosen by a condition.
- A genre's movies: `fetchGenreMovies()` asks `/discover/movie?with_genres=<id>&page=n` and maps the page with `toMoviePage()`. `useGenreMovies(genreId)` is an infinite query under `['genreMovies', genreId]`, stale after an hour, as a search is. The key's root is not in the list of saved queries, so a genre's movies stay in memory.
- The order is TMDb's default for discover, the most popular first. The movies are not limited to upcoming ones: a genre lists every movie TMDb has in it.
- Wording for a genre on Results:
  - Header: the genre's name, from the first frame.
  - No movies: "No <genre> movies right now" and "Try another genre."
  - Failed: "Couldn't load movies".
  - Offline, not browsed this session: "Connect to the internet to browse this genre."
  - Offline, browsed earlier: the movies under "You're offline. Showing movies from earlier."
- A row on a genre's Results shows the movie's first genre, as every other row does (the spec: rows are the same as Top Results). So a row under Science Fiction can say Horror.
- Tests:
  - `SearchScreen.test.tsx` gains 11. The test that expected the prompt now expects the tiles.
  - `ResultsScreen.test.tsx` gains 8.
  - `serveGenreMovies()` in `src/test/tmdb.ts` fakes the discover endpoint, with several pages per genre id, as `serveSearch()` does per query. `serveGenres()` can now hold its answer or fail.
  - `imagePathsIn(element)` in `src/test/images.ts` reads the TMDb file paths of the images drawn inside an element. It is how a test sees which movie a tile shows. An image is decoration to a screen reader, so no role or label finds it.
  - No test tells two columns from four, because Jest has no layout pass.
- Glossary: `CONTEXT.md` gains "Genre grid", and Search and Results now name genres.
- Verified: `npm run check` passes (typecheck, lint with no warnings, 194 tests). On the Pixel 9 Pro emulator (API 35), with TMDb's real data: the grid shows all 19 genres, 17 with different images and 2 (Mystery, TV Movie) as colour tiles; Science Fiction opens Results with its name and its movies, and more load on scroll; in landscape the grid has four columns; in airplane mode a genre not browsed shows the offline state and Science Fiction shows its movies under the banner. On the iPhone 17 Pro simulator (iOS 26.5): the grid in portrait. Not checked: a tap on a tile and landscape on iOS (taps from the agent's tool don't land reliably there), a screen reader on either platform, and the iOS 18.5 simulator.

## Comments

**2026-09-30, context from ticket 08**

- The genre list is already fetched and persisted: `useGenres()`, stale after 7 days. A saved copy is dropped on restore once it is 7 days old (`withoutExpiredQueries`), so offline after 7 days there is no genre list and the grid would be empty.
- List movies carry `genreIds` since ticket 08. An upcoming list saved before that has movies without it, and the cache buster wasn't bumped, so a tile's image lookup must allow for a saved movie with no `genreIds` (or bump the app version).
- Search's idle state is an `EmptyState` prompt in `SearchScreen`, which the grid replaces. A test that expects it: "Movie list's search button opens Search, which asks for a title before any typing".

**2026-09-30, context from ticket 09**

- Results' route params are `{ kind: 'search'; text: string }` (`RootStackParamList` in `src/navigation/RootNavigator.tsx`). A genre is a second kind, such as `{ kind: 'genre'; genre: Genre }`. `ResultsScreen` reads `text` and calls `useSearchResults()` directly, so it needs a branch, or a hook per kind behind one shape (`{ movies, total }`, with the infinite query's paging fields).
- The header title comes from `resultsTitle(total)` in `ResultsScreen`. A genre shows its name instead.
- `moviesOnce()` and `nextPageNumber()` in `src/lib/pages.ts` serve any paged movie list, `toMoviePage()` in `src/api/movies.ts` maps any TMDb movie page, and `PagedMovieList` renders one from an infinite query.
- Search asks TMDb for Top Results only while it is the screen in front (`isInFront` in `useTopResults`). A query Search owns for the genre grid needs no such gate, because the genre list has no debounce.
- The no-match, error, offline and banner texts in `ResultsScreen` speak of searching. A genre needs its own.
- `serveSearch()` in `src/test/tmdb.ts` shows how a fake endpoint serves several pages per key.
