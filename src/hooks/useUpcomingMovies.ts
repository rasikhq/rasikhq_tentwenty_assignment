import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import { fetchUpcomingMovies } from '../api/movies';
import type { Movie, Paged } from '../api/types';
import { HOUR } from '../lib/duration';
import { moviesOnce, nextPageNumber } from '../lib/pages';
import { queryKeys } from '../lib/queryKeys';

function selectMovies(data: InfiniteData<Paged<Movie>, number>): Movie[] {
  return moviesOnce(data.pages);
}

/** The upcoming movies from every page loaded so far, each once, in the order TMDb lists them. */
export function useUpcomingMovies() {
  return useInfiniteQuery({
    queryKey: queryKeys.upcoming(),
    queryFn: ({ pageParam, signal }) => fetchUpcomingMovies(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: nextPageNumber,
    // Older than this, the list refetches when the app returns to the foreground, when the connection
    // comes back and when the app reopens
    staleTime: HOUR,
    select: selectMovies,
  });
}
