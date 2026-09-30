import { View } from 'react-native';

import { useMovieColumnCount } from '../lib/layout';
import { Skeleton } from './Skeleton';
import { SkeletonGrid } from './SkeletonGrid';

type MovieRowsSkeletonProps = {
  /** What a screen reader says for the placeholders. */
  label: string;
  /** How many rows to show. */
  rows: number;
};

/** Stands in for movie rows that are loading, in as many columns as the results have. */
export function MovieRowsSkeleton({ label, rows }: MovieRowsSkeletonProps) {
  const columns = useMovieColumnCount();

  return (
    <SkeletonGrid label={label} rows={rows} columns={columns}>
      <View className="flex-row items-center gap-5 p-2.5">
        <Skeleton className="h-[100px] w-[130px] rounded-xl" />
        <View className="gap-2">
          <Skeleton className="h-4 w-[140px] rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </View>
      </View>
    </SkeletonGrid>
  );
}
