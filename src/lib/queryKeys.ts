/** The first element of each query key, which is what tells the queries of one kind apart from another. */
export const queryKeyRoots = {
  upcoming: 'upcoming',
  movieDetail: 'movieDetail',
} as const;

/** Every TanStack Query key in the app, so keys and invalidation stay consistent. */
export const queryKeys = {
  upcoming: () => [queryKeyRoots.upcoming] as const,
  movieDetail: (id: number) => [queryKeyRoots.movieDetail, id] as const,
};
