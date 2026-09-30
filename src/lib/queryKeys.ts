/** Every TanStack Query key in the app, so keys and invalidation stay consistent. */
export const queryKeys = {
  upcoming: () => ['upcoming'] as const,
  movieDetail: (id: number) => ['movieDetail', id] as const,
};
