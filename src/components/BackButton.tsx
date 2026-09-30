import { Pressable } from 'react-native';

import { ChevronLeft } from './icons/ChevronLeft';

/**
 * A round back button for a header that sits over an image, so it carries its own dark backing to stay
 * visible on a bright image and on the page below it.
 */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      className="h-12 w-12 items-center justify-center rounded-full bg-navy/60 active:opacity-80"
    >
      <ChevronLeft />
    </Pressable>
  );
}
