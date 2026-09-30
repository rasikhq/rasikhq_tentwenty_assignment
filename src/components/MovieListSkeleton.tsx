import { View } from 'react-native';

import { useColumnCount } from '../lib/layout';
import { Skeleton } from './Skeleton';

type MovieListSkeletonProps = {
  /** What a screen reader says for the placeholders. */
  label: string;
  /** How many rows of cards to show. */
  rows: number;
};

/** Stands in for Movie List cards that are loading, in as many columns as the list has. */
export function MovieListSkeleton({ label, rows }: MovieListSkeletonProps) {
  const columns = useColumnCount();

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      className="flex-row flex-wrap overflow-hidden"
    >
      {Array.from({ length: rows * columns }, (_, index) => (
        <View key={index} className={columns === 1 ? 'w-full p-2' : 'w-1/2 p-2'}>
          <Skeleton className="aspect-video rounded-2xl" />
        </View>
      ))}
    </View>
  );
}
