import { infiniteQueryOptions, type InfiniteData } from '@tanstack/react-query';

import { searchMovies } from '../api/movies';
import type { Movie, Paged } from '../api/types';
import { HOUR } from '../lib/duration';
import { nextPageNumber } from '../lib/pages';
import { queryKeys } from '../lib/queryKeys';

/** The pages of a search that are loaded so far. */
export type MovieSearchPages = InfiniteData<Paged<Movie>, number>;

/**
 * The query for the movies that match a normalized search term, page by page. Top Results and Results
 * read the same pages, so Results opens with the page Top Results already has. The pages live under their
 * own term, so what they hold is always for the term they were asked for, never for one the user has
 * moved past (ADR-0001).
 */
export function movieSearchOptions(term: string) {
  return infiniteQueryOptions({
    queryKey: queryKeys.search(term),
    // Reading the signal lets TanStack Query abort the request when the term changes before TMDb answers
    queryFn: ({ pageParam, signal }) => searchMovies(term, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: nextPageNumber,
    // A term searched within the hour shows its results again without asking TMDb
    staleTime: HOUR,
  });
}
