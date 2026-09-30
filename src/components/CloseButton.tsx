import { Pressable, View } from 'react-native';

type CloseButtonProps = {
  /** What it closes, for a screen reader: "Close trailer". */
  label: string;
  onPress: () => void;
};

/** A close button for a dark screen. */
export function CloseButton({ label, onPress }: CloseButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-12 w-12 items-center justify-center rounded-full bg-white/10 active:opacity-80"
    >
      {/* A cross: two bars, turned to cross at their middles */}
      <View className="absolute h-0.5 w-5 rotate-45 bg-white" />
      <View className="absolute h-0.5 w-5 -rotate-45 bg-white" />
    </Pressable>
  );
}
