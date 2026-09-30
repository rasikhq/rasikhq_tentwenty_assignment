import { View } from 'react-native';

type ChevronLeftProps = {
  /** For a dark surface: the chevron goes white. */
  onDark?: boolean;
};

/** A chevron pointing left: two borders of a square, turned to point left. */
export function ChevronLeft({ onDark = false }: ChevronLeftProps) {
  return (
    <View
      // Moved right by 2, because the turned square's point sits left of its box's middle
      className={`h-3 w-3 translate-x-0.5 rotate-45 border-b-2 border-l-2 ${onDark ? 'border-white' : 'border-ink'}`}
    />
  );
}
