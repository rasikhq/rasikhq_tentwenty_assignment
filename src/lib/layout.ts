import { useWindowDimensions } from 'react-native';

/**
 * Window width, in dp, from which a screen counts as wide. It sits where Material's compact width
 * class ends: below it are phones in portrait, above it phones in landscape, tablets and unfolded
 * foldables. Screens read the window width, not the orientation, so split view behaves too.
 */
export const WIDE_BREAKPOINT = 600;

/** How many columns of cards fit: one below the wide breakpoint, two above it. */
export function useColumnCount(): 1 | 2 {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT ? 2 : 1;
}
