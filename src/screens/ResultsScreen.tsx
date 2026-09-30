import type { ListRenderItem } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import { useCallback, type ReactNode } from 'react';
import { View } from 'react-native';

import type { Genre, Movie } from '../api/types';
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
import { useGenreMovies } from '../hooks/useGenreMovies';
import { useGenres } from '../hooks/useGenres';
import { useIsOnline } from '../hooks/useIsOnline';
import { useSearchResults } from '../hooks/useSearchResults';
import { errorMessage } from '../lib/errorMessage';
import { firstGenreName } from '../lib/genres';
import { normalizeSearchTerm } from '../lib/searchTerm';
import type { RootStackParamList } from '../navigation/RootNavigator';

export function ResultsScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Results'>) {
  const { params } = route;
  // Each kind of Results reads its movies with its own hook, so each is its own component
  return params.kind === 'search' ? <SearchResults text={params.text} /> : <GenreResults genre={params.genre} />;
}

/** The header's title for a search: how many movies TMDb says match, once TMDb has answered. */
function resultsTitle(total: number | undefined): string {
  if (total === undefined) return 'Results';
  return total === 1 ? '1 Result Found' : `${total} Results Found`;
}

/** Results for a search: the movies that match it, under how many match. */
function SearchResults({ text }: { text: string }) {
  const search = useSearchResults(normalizeSearchTerm(text));

  return (
    <ResultsView
      title={resultsTitle(search.data?.total)}
      movies={search.data?.movies}
      query={search}
      emptyTitle={`No movies match '${text}'`}
      emptyMessage="Try different words."
      offlineBanner="You're offline. Showing results from earlier."
      offlineMessage="Connect to the internet to search for movies."
      errorTitle="Couldn't search for movies"
    />
  );
}

/** Results for a genre: its movies, under its name. */
function GenreResults({ genre }: { genre: Genre }) {
  const genreMovies = useGenreMovies(genre.id);

  return (
    <ResultsView
      title={genre.name}
      movies={genreMovies.data}
      query={genreMovies}
      emptyTitle={`No ${genre.name} movies right now`}
      emptyMessage="Try another genre."
      offlineBanner="You're offline. Showing movies from earlier."
      offlineMessage="Connect to the internet to browse this genre."
      errorTitle="Couldn't load movies"
    />
  );
}

type ResultsViewProps = {
  /** The header's title. */
  title: string;
  /** The movies of the pages loaded so far. Undefined until the first page arrives. */
  movies: Movie[] | undefined;
  /** The infinite query the movies come from. */
  query: UseInfiniteQueryResult<unknown>;
  /** Said in place of the movies when TMDb has none to list. */
  emptyTitle: string;
  emptyMessage: string;
  /** Said above the movies when they are from earlier in the session and the phone is offline. */
  offlineBanner: string;
  /** What the user can do once online, when offline with no movies from earlier. */
  offlineMessage: string;
  /** What failed when the movies can't be loaded. */
  errorTitle: string;
};

/** What every kind of Results shows: the title beside a back button, and the movies as rows, or their state. */
function ResultsView({
  title,
  movies,
  query,
  emptyTitle,
  emptyMessage,
  offlineBanner,
  offlineMessage,
  errorTitle,
}: ResultsViewProps) {
  const { error, fetchStatus, refetch } = query;
  const navigation = useNavigation();
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
  if (movies) {
    content = (
      <>
        {/* These movies are from earlier in the session: offline, TMDb can't be asked for them afresh */}
        {!isOnline && <OfflineBanner message={offlineBanner} />}
        <PagedMovieList
          label="Results"
          movies={movies}
          renderMovie={renderMovie}
          padding={10}
          nextPage={query}
          empty={<EmptyState title={emptyTitle} message={emptyMessage} />}
          nextPageSkeleton={<MovieRowsSkeleton label="Loading more results" rows={1} />}
          nextPageErrorTitle="Couldn't load more results"
        />
      </>
    );
  } else if (fetchStatus === 'paused') {
    // Offline with no movies from earlier: the request waits for a connection, so no error ever arrives
    content = <OfflineState message={offlineMessage} onRetry={() => void refetch()} />;
  } else if (error) {
    content = <ErrorState title={errorTitle} message={errorMessage(error)} onRetry={() => void refetch()} />;
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
            {title}
          </Text>
        </View>
      }
    >
      {content}
    </Screen>
  );
}
