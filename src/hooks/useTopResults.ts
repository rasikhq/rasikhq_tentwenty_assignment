import { useInfiniteQuery } from '@tanstack/react-query';

import type { Movie } from '../api/types';
import { movieSearchOptions, type MovieSearchPages } from './movieSearchOptions';
import { useIsSettled } from './useIsSettled';

/** How long the term must stay the same before TMDb is asked for it, so typing a word is one request. */
export const SEARCH_DEBOUNCE_MS = 300;

function selectFirstPage(data: MovieSearchPages): Movie[] {
  return data.pages[0].items;
}

type TopResultsOptions = {
  /** Whether Search is the screen in front. Under another screen it asks TMDb for nothing. */
  isInFront: boolean;
};

/**
 * Top Results: the first page of movies that match a normalized search term. What this returns is always
 * for the term it was given (ADR-0001). An empty term searches for nothing.
 */
export function useTopResults(term: string, { isInFront }: TopResultsOptions) {
  const isSettled = useIsSettled(term, SEARCH_DEBOUNCE_MS);

  return useInfiniteQuery({
    // Keyed by the term as it is now, settled or not, so a term searched before shows its results at once
    ...movieSearchOptions(term),
    // The debounce only holds back the request. Under Results, the request is Results' to send: a search
    // that failed there stays failed until the user retries, and doesn't start again when the pause ends
    enabled: term !== '' && isSettled && isInFront,
    select: selectFirstPage,
  });
}
