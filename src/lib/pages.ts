import type { Movie, Paged } from '../api/types';

/** The number of the page after the last one loaded, or undefined once the list has no more pages. */
export function nextPageNumber(lastPage: Paged<unknown>, _pages: unknown, lastPageNumber: number) {
  return lastPageNumber < lastPage.totalPages ? lastPageNumber + 1 : undefined;
}

/**
 * The movies of every page, each once, in the order TMDb lists them. TMDb's pages overlap: movies at the
 * end of one page come back at the start of the next. A movie keeps the place of its first appearance.
 */
export function moviesOnce(pages: Paged<Movie>[]): Movie[] {
  const moviesById = new Map<number, Movie>();
  for (const page of pages) {
    for (const movie of page.items) {
      if (!moviesById.has(movie.id)) {
        moviesById.set(movie.id, movie);
      }
    }
  }
  return [...moviesById.values()];
}
