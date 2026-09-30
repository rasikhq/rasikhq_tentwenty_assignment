import { View } from 'react-native';

import { Skeleton } from './Skeleton';

/** Stands in for a movie's genres, overview and images while its detail loads. */
export function MovieDetailSkeleton() {
  return (
    <View
      accessible
      accessibilityLabel="Loading movie details"
      accessibilityState={{ busy: true }}
      className="gap-5 overflow-hidden"
    >
      <View className="flex-row gap-2 px-5">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </View>
      <View className="gap-2 px-5">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </View>
      <View className="flex-row gap-3 px-5">
        <Skeleton className="aspect-video w-[200px] rounded-xl" />
        <Skeleton className="aspect-video w-[200px] rounded-xl" />
      </View>
    </View>
  );
}
