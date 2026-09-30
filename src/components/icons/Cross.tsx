import { View } from 'react-native';

type CrossProps = {
  /** For a dark surface: the cross goes white. */
  onDark?: boolean;
};

/** A cross, for a button that closes or clears: two bars, turned to cross at their middles. */
export function Cross({ onDark = false }: CrossProps) {
  const bar = `absolute h-0.5 w-5 ${onDark ? 'bg-white' : 'bg-ink'}`;

  return (
    <View className="h-5 w-5 items-center justify-center">
      <View className={`${bar} rotate-45`} />
      <View className={`${bar} -rotate-45`} />
    </View>
  );
}
