import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState, type ReactNode } from 'react';
import { Keyboard, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Genre, Movie } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { GenreGrid } from '../components/GenreGrid';
import { GenreGridSkeleton } from '../components/GenreGridSkeleton';
import { MovieRow } from '../components/MovieRow';
import { MovieRowsSkeleton } from '../components/MovieRowsSkeleton';
import { OfflineBanner } from '../components/OfflineBanner';
import { OfflineState } from '../components/OfflineState';
import { Screen } from '../components/Screen';
import { SearchField } from '../components/SearchField';
import { Text } from '../components/Text';
import { useGenres } from '../hooks/useGenres';
import { useIsOnline } from '../hooks/useIsOnline';
import { useTopResults } from '../hooks/useTopResults';
import { useLoadedUpcomingMovies } from '../hooks/useUpcomingMovies';
import { errorMessage } from '../lib/errorMessage';
import { firstGenreName } from '../lib/genres';
import { genreTiles } from '../lib/genreTiles';
import { useColumnCount } from '../lib/layout';
import { normalizeSearchTerm } from '../lib/searchTerm';
import type { RootStackParamList } from '../navigation/RootNavigator';

export function SearchScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Search'>) {
  const [text, setText] = useState('');
  const term = normalizeSearchTerm(text);
  // The results for this term and no other: a term without results yet has none to show (ADR-0001)
  const isInFront = useIsFocused();
  const { data: results, error, refetch } = useTopResults(term, { isInFront });
  // Rows show without a genre until the genre list arrives, and when it can't be loaded
  const { data: genres } = useGenres();
  const isOnline = useIsOnline();
  const insets = useSafeAreaInsets();
  const columns = useColumnCount();

  const renderMovie: ListRenderItem<Movie> = useCallback(
    ({ item }) => (
      <View className="p-2.5">
        <MovieRow
          movie={item}
          genre={firstGenreName(item, genres)}
          onPress={() => {
            // The field keeps its focus, and on Android the keyboard would stay up over Movie Detail
            Keyboard.dismiss();
            navigation.navigate('MovieDetail', { movie: item });
          }}
        />
      </View>
    ),
    [navigation, genres],
  );

  // Every state sits at the top of the screen, where the keyboard doesn't cover it
  let content: ReactNode;
  if (term === '') {
    content = (
      <GenreBrowse
        onOpen={(genre) => {
          // The field may have the focus, and on Android the keyboard would stay up over Results
          Keyboard.dismiss();
          navigation.navigate('Results', { kind: 'genre', genre });
        }}
      />
    );
  } else if (results?.length === 0) {
    content = <EmptyState title={`No movies match '${text.trim()}'`} message="Try different words." />;
  } else if (results) {
    content = (
      <>
        {/* These results are from earlier in the session: offline, no term can be searched afresh */}
        {!isOnline && <OfflineBanner message="You're offline. Showing results from earlier." />}
        <FlashList
          // As on Movie List, a new column count starts a new list. So does a new term, which opens at its
          // first result and not where the last term's list was scrolled to
          key={`${columns} ${term}`}
          accessibilityLabel="Top Results"
          // The list scrolls under the home indicator, so its end pads by the bottom inset
          contentContainerStyle={{ padding: 10, paddingBottom: 10 + insets.bottom }}
          // A tap on a row opens its movie even while the keyboard is up, and scrolling puts the keyboard away
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          data={results}
          renderItem={renderMovie}
          numColumns={columns}
          ListHeaderComponent={
            <View className="mx-2.5 mb-2.5 border-b border-light-grey py-2.5">
              <Text variant="sectionTitle" accessibilityRole="header">
                Top Results
              </Text>
            </View>
          }
        />
      </>
    );
  } else if (!isOnline) {
    // Offline, the request would only wait for a connection, so this shows on the first keystroke, with
    // no searching row before it
    content = (
      <OfflineState
        inline
        message="Connect to the internet to search for movies."
        onRetry={() => void refetch()}
      />
    );
  } else if (error) {
    content = (
      <ErrorState
        inline
        title="Couldn't search for movies"
        message={errorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  } else {
    content = (
      <View className="p-2.5">
        <MovieRowsSkeleton label="Searching" rows={3} />
      </View>
    );
  }

  function openResults(submitted: string) {
    // Text with nothing but spaces has no term to search for
    if (normalizeSearchTerm(submitted) === '') return;
    navigation.navigate('Results', { kind: 'search', text: submitted.trim() });
  }

  return (
    <Screen
      header={
        <SearchField value={text} onChangeText={setText} onSubmit={openResults} onClose={navigation.goBack} />
      }
    >
      {content}
    </Screen>
  );
}

/** What Search shows before any typing: the genre grid, or where the genre list it comes from stands. */
function GenreBrowse({ onOpen }: { onOpen: (genre: Genre) => void }) {
  const { data: genres, error, fetchStatus, refetch } = useGenres();
  // The tiles take their images from the upcoming movies the app already has, so they ask TMDb for nothing
  const upcoming = useLoadedUpcomingMovies();

  if (genres?.length === 0) {
    // TMDb has genres. Should it ever list none, Search still says what it is for
    return <EmptyState title="Find a movie" message="Search for a movie by its title." />;
  }
  if (genres) {
    return <GenreGrid tiles={genreTiles(genres, upcoming)} onPress={onOpen} />;
  }
  if (fetchStatus === 'paused') {
    // Offline with no saved genre list: the request waits for a connection, so no error ever arrives
    return (
      <OfflineState inline message="Connect to the internet to browse genres." onRetry={() => void refetch()} />
    );
  }
  if (error) {
    return (
      <ErrorState
        inline
        title="Couldn't load genres"
        message={errorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }
  return <GenreGridSkeleton label="Loading genres" />;
}
