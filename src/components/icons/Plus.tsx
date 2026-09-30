import { View } from 'react-native';

/** A plus sign, for a button that adds or zooms in: two bars that cross at their middles. */
export function Plus() {
  return (
    <View className="h-4 w-4 items-center justify-center">
      <View className="absolute h-0.5 w-4 bg-ink" />
      <View className="absolute h-4 w-0.5 bg-ink" />
    </View>
  );
}
