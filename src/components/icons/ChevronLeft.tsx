import { View } from 'react-native';

/** A chevron pointing left, white for a dark surface: two borders of a square, turned to point left. */
export function ChevronLeft() {
  // Moved right by 2, because the turned square's point sits left of its box's middle
  return <View className="h-3 w-3 translate-x-0.5 rotate-45 border-b-2 border-l-2 border-white" />;
}
