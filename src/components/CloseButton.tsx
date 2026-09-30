import { Pressable } from 'react-native';

import { Cross } from './icons/Cross';

/** A round close button for a dark screen. */
export function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      onPress={onPress}
      className="h-12 w-12 items-center justify-center rounded-full bg-white/10 active:opacity-80"
    >
      <Cross onDark />
    </Pressable>
  );
}
