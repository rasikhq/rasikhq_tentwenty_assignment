// The app's own types. The API module maps TMDb's JSON (./tmdbTypes) into these, so screens,
// components and hooks import them and never see a TMDb field name.

/** A movie as a list shows it. */
export type Movie = {
  id: number;
  title: string;
  /** TMDb's file path for the backdrop, or null when TMDb has none yet. imageUrl() turns it into a URL. */
  backdropPath: string | null;
};

/** One page of a paged TMDb list. */
export type Paged<T> = {
  items: T[];
  totalPages: number;
};
