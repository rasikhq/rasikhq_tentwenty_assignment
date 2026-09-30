import { View } from 'react-native';

type CrossProps = {
  /** For a dark surface: the cross goes white. */
  onDark?: boolean;
  /** For a small control, such as a chip's remove button. */
  small?: boolean;
};

/** A cross, for a button that closes, clears or removes: two bars, turned to cross at their middles. */
export function Cross({ onDark = false, small = false }: CrossProps) {
  const bar = `absolute h-0.5 ${small ? 'w-3' : 'w-5'} ${onDark ? 'bg-white' : 'bg-ink'}`;

  return (
    <View className={`items-center justify-center ${small ? 'h-3 w-3' : 'h-5 w-5'}`}>
      <View className={`${bar} rotate-45`} />
      <View className={`${bar} -rotate-45`} />
    </View>
  );
}
