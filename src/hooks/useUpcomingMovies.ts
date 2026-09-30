import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

import { fetchUpcomingMovies } from '../api/movies';
import type { Movie } from '../api/types';
import { HOUR } from '../lib/duration';
import { nextPageNumber, selectMoviesOnce } from '../lib/pages';
import { queryKeys } from '../lib/queryKeys';

const upcomingMoviesOptions = infiniteQueryOptions({
  queryKey: queryKeys.upcoming(),
  queryFn: ({ pageParam, signal }) => fetchUpcomingMovies(pageParam, signal),
  initialPageParam: 1,
  getNextPageParam: nextPageNumber,
  // Older than this, the list refetches when the app returns to the foreground, when the connection
  // comes back and when the app reopens
  staleTime: HOUR,
  select: selectMoviesOnce,
});

/** The upcoming movies from every page loaded so far, each once, in the order TMDb lists them. */
export function useUpcomingMovies() {
  return useInfiniteQuery(upcomingMoviesOptions);
}

const noMovies: Movie[] = [];

/**
 * The upcoming movies the app already holds, loaded by Movie list or saved on the device, without asking
 * TMDb for any. Empty when it holds none.
 */
export function useLoadedUpcomingMovies(): Movie[] {
  return useInfiniteQuery({ ...upcomingMoviesOptions, enabled: false }).data ?? noMovies;
}
