import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Movie } from '../api/types';
import { BackButton } from '../components/BackButton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { MovieRow } from '../components/MovieRow';
import { MovieRowsSkeleton } from '../components/MovieRowsSkeleton';
import { OfflineBanner } from '../components/OfflineBanner';
import { OfflineState } from '../components/OfflineState';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { useGenres } from '../hooks/useGenres';
import { useIsOnline } from '../hooks/useIsOnline';
import { useSearchResults } from '../hooks/useMovieSearch';
import { errorMessage } from '../lib/errorMessage';
import { firstGenreName } from '../lib/genres';
import { useColumnCount } from '../lib/layout';
import { normalizeSearchTerm } from '../lib/searchTerm';
import type { RootStackParamList } from '../navigation/RootNavigator';

// As on Movie List, the first movie on screen is tracked as soon as it shows
const viewabilityConfig = { minimumViewTime: 0 };

/** The header's title: how many movies TMDb says match, once TMDb has answered. */
function resultsTitle(total: number | undefined): string {
  if (total === undefined) return 'Results';
  return total === 1 ? '1 Result Found' : `${total} Results Found`;
}

export function ResultsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Results'>) {
  const { text } = route.params;
  const {
    data: results,
    error,
    fetchStatus,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useSearchResults(normalizeSearchTerm(text));
  // Rows show without a genre until the genre list arrives, and when it can't be loaded
  const { data: genres } = useGenres();
  const isOnline = useIsOnline();
  const insets = useSafeAreaInsets();
  const columns = useColumnCount();
  // The first movie on screen. A new column count starts a new list, which opens at this movie
  const firstVisibleIndex = useRef(0);

  const renderMovie: ListRenderItem<Movie> = useCallback(
    ({ item }) => (
      <View className="p-2.5">
        <MovieRow
          movie={item}
          genre={firstGenreName(item, genres)}
          onPress={() => navigation.navigate('MovieDetail', { movie: item })}
        />
      </View>
    ),
    [navigation, genres],
  );

  let content: ReactNode;
  if (results) {
    let footer: ReactNode = null;
    if (isFetchNextPageError) {
      footer = (
        <ErrorState
          inline
          title="Couldn't load more results"
          message={errorMessage(error)}
          onRetry={() => void fetchNextPage()}
        />
      );
    } else if (isFetchingNextPage) {
      footer = <MovieRowsSkeleton label="Loading more results" rows={1} />;
    }

    content = (
      <>
        {/* These results are from earlier in the session: offline, they can't be searched afresh */}
        {!isOnline && <OfflineBanner message="You're offline. Showing results from earlier." />}
        <FlashList
          // As on Movie List, a new column count starts a new list
          key={columns}
          initialScrollIndex={firstVisibleIndex.current}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={({ viewableItems }) => {
            firstVisibleIndex.current = viewableItems[0]?.index ?? 0;
          }}
          accessibilityLabel="Results"
          // The list scrolls under the home indicator, so its end pads by the bottom inset
          contentContainerStyle={{ padding: 10, paddingBottom: 10 + insets.bottom }}
          data={results.movies}
          renderItem={renderMovie}
          numColumns={columns}
          ListEmptyComponent={
            <EmptyState title={`No movies match '${text}'`} message="Try different words." />
          }
          ListFooterComponent={footer}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
              void fetchNextPage();
            }
          }}
        />
      </>
    );
  } else if (fetchStatus === 'paused') {
    // Offline with no results from earlier: the request waits for a connection, so no error ever arrives
    content = (
      <OfflineState message="Connect to the internet to search for movies." onRetry={() => void refetch()} />
    );
  } else if (error) {
    content = (
      <ErrorState
        title="Couldn't search for movies"
        message={errorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  } else {
    content = (
      <View className="p-2.5">
        <MovieRowsSkeleton label="Loading results" rows={6} />
      </View>
    );
  }

  return (
    <Screen
      header={
        <View className="flex-1 flex-row items-center">
          <BackButton onPress={navigation.goBack} />
          <Text variant="title" accessibilityRole="header">
            {resultsTitle(results?.total)}
          </Text>
        </View>
      }
    >
      {content}
    </Screen>
  );
}
