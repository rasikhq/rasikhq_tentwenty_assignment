import { infiniteQueryOptions, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import { searchMovies } from '../api/movies';
import type { Movie, Paged } from '../api/types';
import { HOUR } from '../lib/duration';
import { moviesOnce, nextPageNumber } from '../lib/pages';
import { queryKeys } from '../lib/queryKeys';
import { useIsSettled } from './useIsSettled';

/** How long the term must stay the same before TMDb is asked for it, so typing a word is one request. */
export const SEARCH_DEBOUNCE_MS = 300;

type SearchPages = InfiniteData<Paged<Movie>, number>;

/**
 * The movies that match a normalized search term, page by page. Top Results and Results read the same
 * pages, so Results opens with the page Top Results already has. The pages live under their own term, so
 * what they hold is always for the term they were asked for, never for one the user has moved past
 * (ADR-0001).
 */
function movieSearch(term: string) {
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

function selectFirstPage(data: SearchPages): Movie[] {
  return data.pages[0].items;
}

function selectResults(data: SearchPages) {
  return { movies: moviesOnce(data.pages), total: data.pages[0].totalResults };
}

/** Top Results: the first page of movies that match a search term. An empty term searches for nothing. */
export function useTopResults(term: string) {
  const isSettled = useIsSettled(term, SEARCH_DEBOUNCE_MS);

  return useInfiniteQuery({
    // Keyed by the term as it is now, settled or not, so a term searched before shows its results at once
    ...movieSearch(term),
    // The debounce only holds back the request
    enabled: term !== '' && isSettled,
    select: selectFirstPage,
  });
}

/**
 * Every movie that matches a search term, from the pages loaded so far, each movie once, with how many
 * TMDb says match in all.
 */
export function useSearchResults(term: string) {
  return useInfiniteQuery({ ...movieSearch(term), select: selectResults });
}
