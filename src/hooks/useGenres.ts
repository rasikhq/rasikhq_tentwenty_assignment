import { useQuery } from '@tanstack/react-query';

import { fetchGenres } from '../api/genres';
import { DAY } from '../lib/duration';
import { queryKeys } from '../lib/queryKeys';

/** The genre list: every genre a movie can have, with its name. */
export function useGenres() {
  return useQuery({
    queryKey: queryKeys.genres(),
    queryFn: ({ signal }) => fetchGenres(signal),
    // TMDb's genres rarely change, so the list is fetched once and then read from the saved copy
    staleTime: 7 * DAY,
  });
}
