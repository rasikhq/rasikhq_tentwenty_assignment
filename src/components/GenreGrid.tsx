import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Genre } from '../api/types';
import type { GenreTile as Tile } from '../lib/genreTiles';
import { useGenreColumnCount } from '../lib/layout';
import { GenreTile } from './GenreTile';

type GenreGridProps = {
  tiles: Tile[];
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
      contentContainerStyle={{ padding: 15, paddingBottom: 15 + insets.bottom }}
      // A tap on a tile opens its genre even while the keyboard is up, and scrolling puts the keyboard away
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <View className="flex-row flex-wrap">
        {tiles.map((tile, index) => (
          <View key={tile.genre.id} className={`p-[5px] ${columns === 2 ? 'w-1/2' : 'w-1/4'}`}>
            <GenreTile tile={tile} index={index} onPress={() => onPress(tile.genre)} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
