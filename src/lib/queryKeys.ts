/** The first element of each query key, which is what tells the queries of one kind apart from another. */
export const queryKeyRoots = {
  upcoming: 'upcoming',
  movieDetail: 'movieDetail',
  search: 'search',
  genres: 'genres',
} as const;

/** Every TanStack Query key in the app, so keys and invalidation stay consistent. */
export const queryKeys = {
  upcoming: () => [queryKeyRoots.upcoming] as const,
  movieDetail: (id: number) => [queryKeyRoots.movieDetail, id] as const,
  /** Keyed by the normalized search term, so an answer can only land under the term it was asked for (ADR-0001). */
  search: (term: string) => [queryKeyRoots.search, term] as const,
  genres: () => [queryKeyRoots.genres] as const,
};
