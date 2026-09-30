import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Genre } from '../api/types';
import type { GenreBackdrop } from '../lib/genreBackdrops';
import { columnWidthClass, useGenreColumnCount } from '../lib/layout';
import { GenreTile } from './GenreTile';

type GenreGridProps = {
  /** The genres, each with the backdrop its tile shows. */
  tiles: GenreBackdrop[];
  /** A tile was tapped. */
  onPress: (genre: Genre) => void;
};

/** The genre grid: a tile for each genre, two to a row below the wide breakpoint and four above it. */
export function GenreGrid({ tiles, onPress }: GenreGridProps) {
  const insets = useSafeAreaInsets();
  const columns = useGenreColumnCount();

  return (
    <ScrollView
      accessibilityLabel="Genres"
      // The grid scrolls under the home indicator, so its end pads by the bottom inset
      contentContainerStyle={{ padding: 16, paddingBottom: 16 + insets.bottom }}
      // A tap on a tile opens its genre even while the keyboard is up, and scrolling puts the keyboard away
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View className="flex-row flex-wrap">
        {tiles.map(({ genre, backdropPath }, index) => (
          <View key={genre.id} className={`p-1 ${columnWidthClass[columns]}`}>
            <GenreTile genre={genre} backdropPath={backdropPath} index={index} onPress={() => onPress(genre)} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
