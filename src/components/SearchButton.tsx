import { Pressable } from 'react-native';

import { Magnifier } from './icons/Magnifier';

/** The header's search button. */
export function SearchButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Search"
      onPress={onPress}
      // The icon is smaller than its touch target, so the margin lines the icon up with the header's edge
      className="-mr-3 h-12 w-12 items-center justify-center rounded-full active:opacity-80"
    >
      <Magnifier />
    </Pressable>
  );
}
