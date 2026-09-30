import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchGenreMovies } from '../api/movies';
import { HOUR } from '../lib/duration';
import { nextPageNumber, selectMoviesOnce } from '../lib/pages';
import { queryKeys } from '../lib/queryKeys';

/** A genre's movies from every page loaded so far, each once, in the order TMDb lists them. */
export function useGenreMovies(genreId: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.genreMovies(genreId),
    queryFn: ({ pageParam, signal }) => fetchGenreMovies(genreId, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: nextPageNumber,
    // A genre browsed within the hour shows its movies again without asking TMDb
    staleTime: HOUR,
    select: selectMoviesOnce,
  });
}
