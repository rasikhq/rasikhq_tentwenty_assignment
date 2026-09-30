import { View } from "react-native";

/** A magnifying glass, the Figma's search icon: a ring, with a handle turned out from its lower right.
 ** Dev Note: I really didn't want to introduce an entire icon library just for this one icon.
 ** Similarly, I didn't want to use an image asset either because that would require a separate asset for each screen density.
 ** So I just drew it with a couple of Views. Its simple and effective, does the job perfectly.
 */
export function Magnifier() {
  return (
    <View className="h-5 w-5">
      <View className="h-[14px] w-[14px] rounded-full border-2 border-ink" />
      <View className="absolute left-[11px] top-[14px] h-0.5 w-2 rotate-45 bg-ink" />
    </View>
  );
}
