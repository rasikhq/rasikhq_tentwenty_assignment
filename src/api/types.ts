// The app's own types. The API module maps TMDb's JSON (./tmdbTypes) into these, so screens,
// components and hooks import them and never see a TMDb field name.

/** A movie as a list shows it. */
export type Movie = {
  id: number;
  title: string;
  /** TMDb's file path for the backdrop, or null when TMDb has none yet. imageUrl() turns it into a URL. */
  backdropPath: string | null;
  /** The ids of the movie's genres, in TMDb's order. The genre list has their names. */
  genreIds: number[];
};

/** A genre such as Comedy or Crime. */
export type Genre = {
  id: number;
  name: string;
};

/** A movie's trailer: a YouTube video. */
export type Trailer = {
  /** The video's key on YouTube, the `v` of its watch URL. */
  videoKey: string;
};

/** A movie as its detail shows it: what a list shows, with its genres in full in place of their ids, and the rest. */
export type MovieDetail = Omit<Movie, 'genreIds'> & {
  /** "2021-12-22", or null when TMDb has no release date. */
  releaseDate: string | null;
  genres: Genre[];
  /** Empty when TMDb has none. */
  overview: string;
  /** TMDb's file paths for the movie's backdrop images, for the image strip. */
  backdropPaths: string[];
  /** Null when the movie has no trailer. */
  trailer: Trailer | null;
};

/** One page of a paged TMDb list. */
export type Paged<T> = {
  items: T[];
  totalPages: number;
  /** How many items the whole list has, across all its pages. */
  totalResults: number;
};
