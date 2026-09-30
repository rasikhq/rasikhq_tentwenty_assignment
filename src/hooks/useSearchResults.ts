import { useInfiniteQuery } from '@tanstack/react-query';

import { moviesOnce } from '../lib/pages';
import { movieSearchOptions, type MovieSearchPages } from './movieSearchOptions';

function selectResults(data: MovieSearchPages) {
  return { movies: moviesOnce(data.pages), total: data.pages[0].totalResults };
}

/**
 * Results: every movie that matches a normalized search term, from the pages loaded so far, each movie
 * once, with how many TMDb says match in all.
 */
export function useSearchResults(term: string) {
  return useInfiniteQuery({ ...movieSearchOptions(term), select: selectResults });
}
