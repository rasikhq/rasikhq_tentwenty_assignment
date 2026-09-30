import { Pressable } from 'react-native';

import { Text } from './Text';

const variants = {
  /** The Figma's filled button. */
  filled: { button: 'bg-sky', text: 'button' },
  /** The Figma's outlined button, for a dark surface: a movie's image or the trailer screen. */
  outline: { button: 'border border-sky', text: 'buttonOnDark' },
} as const;

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: keyof typeof variants;
};

/** The Figma's buttons. Variants are added as screens need them. */
export function Button({ label, onPress, variant = 'filled' }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded-full px-6 active:opacity-80 ${variants[variant].button}`}
    >
      <Text variant={variants[variant].text}>{label}</Text>
    </Pressable>
  );
}
