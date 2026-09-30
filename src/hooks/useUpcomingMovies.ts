import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import { fetchUpcomingMovies } from '../api/movies';
import type { Movie, Paged } from '../api/types';
import { queryKeys } from '../lib/queryKeys';

// TMDb's pages overlap: movies at the end of one page come back at the start of the next. A movie
// keeps the place of its first appearance.
function selectMovies(data: InfiniteData<Paged<Movie>, number>): Movie[] {
  const moviesById = new Map<number, Movie>();
  for (const page of data.pages) {
    for (const movie of page.items) {
      if (!moviesById.has(movie.id)) {
        moviesById.set(movie.id, movie);
      }
    }
  }
  return [...moviesById.values()];
}

/** The upcoming movies from every page loaded so far, each once, in the order TMDb lists them. */
export function useUpcomingMovies() {
  return useInfiniteQuery({
    queryKey: queryKeys.upcoming(),
    queryFn: ({ pageParam, signal }) => fetchUpcomingMovies(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPageParam < lastPage.totalPages ? lastPageParam + 1 : undefined,
    select: selectMovies,
  });
}
