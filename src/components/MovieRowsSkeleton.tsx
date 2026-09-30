import { View } from 'react-native';

import { useColumnCount } from '../lib/layout';
import { Skeleton } from './Skeleton';

type MovieRowsSkeletonProps = {
  /** What a screen reader says for the placeholders. */
  label: string;
  /** How many rows to show. */
  rows: number;
};

/** Stands in for movie rows that are loading, in as many columns as the results have. */
export function MovieRowsSkeleton({ label, rows }: MovieRowsSkeletonProps) {
  const columns = useColumnCount();

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      className="flex-row flex-wrap overflow-hidden"
    >
      {Array.from({ length: rows * columns }, (_, index) => (
        <View key={index} className={`flex-row items-center gap-5 p-2.5 ${columns === 1 ? 'w-full' : 'w-1/2'}`}>
          <Skeleton className="h-[100px] w-[130px] rounded-xl" />
          <View className="gap-2">
            <Skeleton className="h-4 w-[140px] rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </View>
        </View>
      ))}
    </View>
  );
}
