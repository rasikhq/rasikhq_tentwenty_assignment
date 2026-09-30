import { View } from 'react-native';

import { useGenreColumnCount } from '../lib/layout';
import { Skeleton } from './Skeleton';
import { SkeletonGrid } from './SkeletonGrid';

/** Stands in for the genre grid while the genre list loads, in as many columns as the grid has. */
export function GenreGridSkeleton({ label }: { label: string }) {
  const columns = useGenreColumnCount();

  return (
    <View className="p-[15px]">
      <SkeletonGrid label={label} rows={5} columns={columns}>
        <View className="p-[5px]">
          <Skeleton className="h-[100px] rounded-xl" />
        </View>
      </SkeletonGrid>
    </View>
  );
}
