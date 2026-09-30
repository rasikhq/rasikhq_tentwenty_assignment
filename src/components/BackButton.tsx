import { Pressable } from 'react-native';

import { ChevronLeft } from './icons/ChevronLeft';

type BackButtonProps = {
  onPress: () => void;
  /**
   * For a dark surface, such as a header that sits over an image: the chevron goes white, on a dark
   * backing of the button's own that keeps it visible on a bright image and on the page below it.
   * Without it, the button is a plain ink chevron for the header bar.
   */
  onDark?: boolean;
};

/** A round back button. */
export function BackButton({ onPress, onDark = false }: BackButtonProps) {
  // In the header bar, the chevron is smaller than its touch target, so the margin lines it up with the bar's edge
  const surface = onDark ? 'bg-navy/60' : '-ml-3';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      className={`h-12 w-12 items-center justify-center rounded-full active:opacity-80 ${surface}`}
    >
      <ChevronLeft onDark={onDark} />
    </Pressable>
  );
}
