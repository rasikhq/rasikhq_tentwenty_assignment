import { useQuery } from '@tanstack/react-query';

import { searchMovies } from '../api/movies';
import { HOUR } from '../lib/duration';
import { queryKeys } from '../lib/queryKeys';
import { useDebouncedValue } from './useDebouncedValue';

// How long the term must stay the same before TMDb is asked for it, so typing a word is one request
const SEARCH_DEBOUNCE_MS = 300;

/**
 * The first page of movies that match a normalized search term. The results live under their own term,
 * so what this returns is always for the term it was given, never for one the user has moved past
 * (ADR-0001). An empty term searches for nothing.
 */
export function useMovieSearch(term: string) {
  const settledTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);

  return useQuery({
    // Keyed by the term itself, not the settled one, so a term searched before shows its results at once
    queryKey: queryKeys.search(term),
    // Reading the signal lets TanStack Query abort the request when the term changes before TMDb answers
    queryFn: ({ signal }) => searchMovies(term, signal),
    // The debounce only holds back the request
    enabled: term !== '' && term === settledTerm,
    // A term searched within the hour shows its results again without asking TMDb
    staleTime: HOUR,
  });
}
