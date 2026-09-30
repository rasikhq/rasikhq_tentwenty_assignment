import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { imageUrl } from '../api/images';
import type { Genre } from '../api/types';
import { Scrim } from './Scrim';
import { Text } from './Text';

// The Figma's palette colours, in the order tiles cycle through them, as chips do
const colours = ['bg-teal', 'bg-pink', 'bg-purple', 'bg-gold'] as const;

type GenreTileProps = {
  genre: Genre;
  /** TMDb's file path for the backdrop of a movie in the genre, or null when the tile has none to show. */
  backdropPath: string | null;
  /** The tile's place in the grid, which picks its colour: teal, pink, purple, gold, then round again. */
  index: number;
  onPress: () => void;
};

/**
 * A genre as a tile of the genre grid: its name over a darkening gradient, on the backdrop of a movie in
 * the genre. The palette colour shows while the image loads, and stays when the tile has no backdrop.
 */
export function GenreTile({ genre, backdropPath, index, onPress }: GenreTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={genre.name}
      onPress={onPress}
      className={`h-[100px] overflow-hidden rounded-xl active:opacity-80 ${colours[index % colours.length]}`}
    >
      {backdropPath && (
        <Image
          // The size a Movie list card shows, so a backdrop seen there is already on the device
          source={imageUrl(backdropPath, 'card')}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={StyleSheet.absoluteFill}
          // Decoration: the genre's name says what the tile opens
          accessible={false}
        />
      )}
      <Scrim />
      <View className="flex-1 justify-end p-2.5">
        <Text variant="tileTitle" numberOfLines={2}>
          {genre.name}
        </Text>
      </View>
    </Pressable>
  );
}
