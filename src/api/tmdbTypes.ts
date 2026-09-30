// TMDb's JSON shapes, as the API sends them. Only src/api and the test fakes import this file:
// the rest of the app uses the app types in ./types, which the API module maps these into.

/** A movie in a list response such as /movie/upcoming. TMDb sends more fields than the app reads. */
export type TmdbMovie = {
  id: number;
  title: string;
  backdrop_path: string | null;
};

/** A paged list response. */
export type TmdbPage<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};
