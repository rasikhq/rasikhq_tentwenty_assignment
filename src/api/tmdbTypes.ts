// TMDb's JSON shapes, as the API sends them. Only src/api and the test fakes import this file:
// the rest of the app uses the app types in ./types, which the API module maps these into.

/** A movie in a list response such as /movie/upcoming or /search/movie. TMDb sends more fields than the app reads. */
export type TmdbMovie = {
  id: number;
  title: string;
  backdrop_path: string | null;
  /** The ids of the movie's genres. /genre/movie/list has their names. */
  genre_ids: number[];
};

/** A genre as TMDb lists it on a movie's detail and in /genre/movie/list. */
export type TmdbGenre = {
  id: number;
  name: string;
};

/** The response of /genre/movie/list: every genre a movie can have. */
export type TmdbGenreList = {
  genres: TmdbGenre[];
};

/** A video TMDb lists for a movie. TMDb sends more fields than the app reads. */
export type TmdbVideo = {
  /** The video's id on its site. For YouTube, the `v` of the watch URL. */
  key: string;
  /** "YouTube" or "Vimeo". */
  site: string;
  /** "Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes" or "Bloopers". */
  type: string;
  /** Whether the video comes from the movie's own studio or distributor. */
  official: boolean;
};

/**
 * A movie from /movie/{id} with videos and images appended. It lists its genres in full, where a list
 * response has only their ids. TMDb sends more fields than the app reads.
 */
export type TmdbMovieDetail = Omit<TmdbMovie, 'genre_ids'> & {
  /** "2021-12-22", or an empty string when TMDb has no release date. */
  release_date: string;
  overview: string;
  genres: TmdbGenre[];
  videos: { results: TmdbVideo[] };
  images: { backdrops: { file_path: string }[] };
};

/** A paged list response. */
export type TmdbPage<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};
