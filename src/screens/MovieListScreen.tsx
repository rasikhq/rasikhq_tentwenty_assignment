import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Movie } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { MovieCard } from '../components/MovieCard';
import { MovieListSkeleton } from '../components/MovieListSkeleton';
import { Screen } from '../components/Screen';
import { useUpcomingMovies } from '../hooks/useUpcomingMovies';
import { errorMessage } from '../lib/errorMessage';
import { useColumnCount } from '../lib/layout';

// FlashList reports the movies on screen only after they've been there for 250 ms by default. Tracking the
// first one is cheap, so it reports at once
const viewabilityConfig = { minimumViewTime: 0 };

const renderMovie: ListRenderItem<Movie> = ({ item }) => (
  <View className="p-2">
    <MovieCard movie={item} />
  </View>
);

export function MovieListScreen() {
  const {
    data: movies,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useUpcomingMovies();
  const insets = useSafeAreaInsets();
  const columns = useColumnCount();
  // The first movie on screen. A new column count starts a new list, which opens at this movie
  const firstVisibleIndex = useRef(0);
  // The pull-to-refresh spinner belongs to the user's pull, so it doesn't show for a refetch the app starts
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refresh() {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }

  let content: ReactNode;
  if (movies) {
    let footer: ReactNode = null;
    if (isFetchNextPageError) {
      footer = (
        <ErrorState
          inline
          title="Couldn't load more movies"
          message={errorMessage(error)}
          onRetry={() => void fetchNextPage()}
        />
      );
    } else if (isFetchingNextPage) {
      footer = <MovieListSkeleton label="Loading more movies" rows={1} />;
    }

    content = (
      <FlashList
        // FlashList keeps the old row sizes when its column count changes, which left a gap between
        // two cards after rotating, so a new column count starts a new list
        key={columns}
        initialScrollIndex={firstVisibleIndex.current}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={({ viewableItems }) => {
          firstVisibleIndex.current = viewableItems[0]?.index ?? 0;
        }}
        accessibilityLabel="Upcoming movies"
        // The list scrolls under the home indicator, so its end pads by the bottom inset
        contentContainerStyle={{ padding: 8, paddingBottom: 8 + insets.bottom }}
        data={movies}
        renderItem={renderMovie}
        numColumns={columns}
        ListEmptyComponent={
          <EmptyState title="No upcoming movies right now" message="Pull down to check again." />
        }
        ListFooterComponent={footer}
        refreshing={isRefreshing}
        onRefresh={() => void refresh()}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
            void fetchNextPage();
          }
        }}
      />
    );
  } else if (error) {
    content = (
      <ErrorState title="Couldn't load movies" message={errorMessage(error)} onRetry={() => void refetch()} />
    );
  } else {
    content = (
      <View className="p-2">
        <MovieListSkeleton label="Loading upcoming movies" rows={4} />
      </View>
    );
  }

  return <Screen title="Watch">{content}</Screen>;
}
