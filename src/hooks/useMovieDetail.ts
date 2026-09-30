import { useQuery } from '@tanstack/react-query';

import { fetchMovieDetail } from '../api/movies';
import { DAY } from '../lib/duration';
import { queryKeys } from '../lib/queryKeys';

/** The full detail of one movie. */
export function useMovieDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.movieDetail(id),
    queryFn: ({ signal }) => fetchMovieDetail(id, signal),
    // Older than this, an opened detail refetches when it is opened again, when the app returns to the
    // foreground and when the connection comes back
    staleTime: DAY,
  });
}
