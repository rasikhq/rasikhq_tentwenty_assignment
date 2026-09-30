import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState, type ReactNode } from 'react';
import { Keyboard, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Movie } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { MovieRow } from '../components/MovieRow';
import { MovieRowsSkeleton } from '../components/MovieRowsSkeleton';
import { OfflineBanner } from '../components/OfflineBanner';
import { OfflineState } from '../components/OfflineState';
import { Screen } from '../components/Screen';
import { SearchField } from '../components/SearchField';
import { Text } from '../components/Text';
import { useGenres } from '../hooks/useGenres';
import { useIsOnline } from '../hooks/useIsOnline';
import { useMovieSearch } from '../hooks/useMovieSearch';
import { errorMessage } from '../lib/errorMessage';
import { firstGenreName } from '../lib/genres';
import { useColumnCount } from '../lib/layout';
import { normalizeSearchTerm } from '../lib/searchTerm';
import type { RootStackParamList } from '../navigation/RootNavigator';

export function SearchScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Search'>) {
  const [text, setText] = useState('');
  const term = normalizeSearchTerm(text);
  // The results for this term and no other: a term without results yet has none to show (ADR-0001)
  const { data: results, error, refetch } = useMovieSearch(term);
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
    content = <EmptyState title="Find a movie" message="Search for a movie by its title." />;
  } else if (results?.items.length === 0) {
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
          data={results.items}
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

  return (
    <Screen header={<SearchField value={text} onChangeText={setText} onClose={navigation.goBack} />}>
      {content}
    </Screen>
  );
}
