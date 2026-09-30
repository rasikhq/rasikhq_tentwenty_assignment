import { Pressable } from 'react-native';

import { Text } from './Text';

type ButtonProps = {
  label: string;
  onPress: () => void;
};

/** The Figma's filled button. Variants are added as screens need them. */
export function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-12 items-center justify-center rounded-full bg-sky px-6 active:opacity-80"
    >
      <Text variant="button">{label}</Text>
    </Pressable>
  );
}
