import type { ListRenderItem } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import type { Movie } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { MovieCard } from '../components/MovieCard';
import { MovieListSkeleton } from '../components/MovieListSkeleton';
import { OfflineBanner } from '../components/OfflineBanner';
import { OfflineState } from '../components/OfflineState';
import { PagedMovieList } from '../components/PagedMovieList';
import { Screen } from '../components/Screen';
import { SearchButton } from '../components/SearchButton';
import { Text } from '../components/Text';
import { useIsOnline } from '../hooks/useIsOnline';
import { useUpcomingMovies } from '../hooks/useUpcomingMovies';
import { errorMessage } from '../lib/errorMessage';

export function MovieListScreen() {
  const upcoming = useUpcomingMovies();
  const { data: movies, error, fetchStatus, refetch } = upcoming;
  const isOnline = useIsOnline();
  const navigation = useNavigation();
  // The pull-to-refresh spinner belongs to the user's pull, so it doesn't show for a refetch the app starts
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refresh() {
    // Offline, the refetch waits for a connection. The spinner would turn until then, over movies
    // the offline banner has already said are saved ones.
    if (!isOnline) return;
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }

  const renderMovie: ListRenderItem<Movie> = useCallback(
    ({ item }) => (
      <View className="p-2">
        <MovieCard movie={item} onPress={() => navigation.navigate('MovieDetail', { movie: item })} />
      </View>
    ),
    [navigation],
  );

  let content: ReactNode;
  if (movies) {
    content = (
      <>
        {!isOnline && <OfflineBanner message="You're offline. Showing saved movies." />}
        <PagedMovieList
          label="Upcoming movies"
          movies={movies}
          renderMovie={renderMovie}
          padding={8}
          nextPage={upcoming}
          empty={<EmptyState title="No upcoming movies right now" message="Pull down to check again." />}
          nextPageSkeleton={<MovieListSkeleton label="Loading more movies" rows={1} />}
          nextPageErrorTitle="Couldn't load more movies"
          refreshing={isRefreshing}
          onRefresh={() => void refresh()}
        />
      </>
    );
  } else if (fetchStatus === 'paused') {
    // Offline with nothing saved: the request waits for a connection, so no error ever arrives
    content = (
      <OfflineState message="Connect to the internet to load upcoming movies." onRetry={() => void refetch()} />
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

  return (
    <Screen
      header={
        <>
          <Text variant="title" accessibilityRole="header">
            Watch
          </Text>
          <SearchButton onPress={() => navigation.navigate('Search')} />
        </>
      }
    >
      {content}
    </Screen>
  );
}
