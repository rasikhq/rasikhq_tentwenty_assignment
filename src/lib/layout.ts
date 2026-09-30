import { useWindowDimensions } from 'react-native';

/**
 * Window width, in dp, from which a screen counts as wide. It sits where Material's compact width
 * class ends: below it are phones in portrait, above it phones in landscape, tablets and unfolded
 * foldables. Screens read the window width, not the orientation, so split view behaves too.
 */
export const WIDE_BREAKPOINT = 600;

/** Whether the window is at or above the wide breakpoint. */
export function useIsWide(): boolean {
  return useWindowDimensions().width >= WIDE_BREAKPOINT;
}

/** How many columns of movies fit: one below the wide breakpoint, two above it. */
export function useMovieColumnCount(): 1 | 2 {
  return useIsWide() ? 2 : 1;
}

/** How many columns of genre tiles fit: two below the wide breakpoint, four above it. */
export function useGenreColumnCount(): 2 | 4 {
  return useIsWide() ? 4 : 2;
}

/** The width of one column as a class name, by how many columns share the row. */
export const columnWidthClass = { 1: 'w-full', 2: 'w-1/2', 4: 'w-1/4' } as const;
