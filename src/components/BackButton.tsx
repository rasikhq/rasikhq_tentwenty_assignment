import { Pressable } from 'react-native';

import { ChevronLeft } from './icons/ChevronLeft';

type BackButtonProps = {
  onPress: () => void;
  /**
   * For a header that sits over an image: the button carries its own dark backing, to stay visible on a
   * bright image and on the page below it. Without it, the button is a plain chevron for the header bar.
   */
  onImage?: boolean;
};

/** A round back button. */
export function BackButton({ onPress, onImage = false }: BackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      className={`h-12 w-12 items-center justify-center rounded-full active:opacity-80 ${
        // The chevron is smaller than its touch target, so the margin lines it up with the header bar's edge
        onImage ? 'bg-navy/60' : '-ml-3'
      }`}
    >
      <ChevronLeft onDark={onImage} />
    </Pressable>
  );
}
