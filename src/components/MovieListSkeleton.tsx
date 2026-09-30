import { View } from 'react-native';

import { Skeleton } from './Skeleton';
import { SkeletonGrid } from './SkeletonGrid';

type MovieListSkeletonProps = {
  /** What a screen reader says for the placeholders. */
  label: string;
  /** How many rows of cards to show. */
  rows: number;
};

/** Stands in for Movie List cards that are loading, in as many columns as the list has. */
export function MovieListSkeleton({ label, rows }: MovieListSkeletonProps) {
  return (
    <SkeletonGrid label={label} rows={rows}>
      <View className="p-2">
        <Skeleton className="aspect-video rounded-2xl" />
      </View>
    </SkeletonGrid>
  );
}
