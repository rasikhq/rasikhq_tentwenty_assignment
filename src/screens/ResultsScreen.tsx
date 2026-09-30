import type { ListRenderItem } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, type ReactNode } from 'react';
import { View } from 'react-native';

import type { Movie } from '../api/types';
import { BackButton } from '../components/BackButton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { MovieRow } from '../components/MovieRow';
import { MovieRowsSkeleton } from '../components/MovieRowsSkeleton';
import { OfflineBanner } from '../components/OfflineBanner';
import { OfflineState } from '../components/OfflineState';
import { PagedMovieList } from '../components/PagedMovieList';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { useGenres } from '../hooks/useGenres';
import { useIsOnline } from '../hooks/useIsOnline';
import { useSearchResults } from '../hooks/useSearchResults';
import { errorMessage } from '../lib/errorMessage';
import { firstGenreName } from '../lib/genres';
import { normalizeSearchTerm } from '../lib/searchTerm';
import type { RootStackParamList } from '../navigation/RootNavigator';

/** The header's title: how many movies TMDb says match, once TMDb has answered. */
function resultsTitle(total: number | undefined): string {
  if (total === undefined) return 'Results';
  return total === 1 ? '1 Result Found' : `${total} Results Found`;
}

export function ResultsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Results'>) {
  const { text } = route.params;
  const search = useSearchResults(normalizeSearchTerm(text));
  const { data: results, error, fetchStatus, refetch } = search;
  // Rows show without a genre until the genre list arrives, and when it can't be loaded
  const { data: genres } = useGenres();
  const isOnline = useIsOnline();

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
    content = (
      <>
        {/* These results are from earlier in the session: offline, they can't be searched afresh */}
        {!isOnline && <OfflineBanner message="You're offline. Showing results from earlier." />}
        <PagedMovieList
          label="Results"
          movies={results.movies}
          renderMovie={renderMovie}
          padding={10}
          nextPage={search}
          empty={<EmptyState title={`No movies match '${text}'`} message="Try different words." />}
          nextPageSkeleton={<MovieRowsSkeleton label="Loading more results" rows={1} />}
          nextPageErrorTitle="Couldn't load more results"
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
