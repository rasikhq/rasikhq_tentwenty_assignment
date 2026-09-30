import { Pressable, View } from 'react-native';

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
      {/* A chevron: two borders of a square, turned to point left */}
      <View className="h-3 w-3 translate-x-0.5 rotate-45 border-b-2 border-l-2 border-white" />
    </Pressable>
  );
}
