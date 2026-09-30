import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { imageUrl } from '../api/images';
import type { Movie } from '../api/types';
import { Text } from './Text';

type MovieRowProps = {
  movie: Movie;
  /** The name of the movie's first genre, when the movie has a genre and the genre list has arrived. */
  genre?: string;
  onPress: () => void;
};

/** A movie as a row of search results: a thumbnail, with the title and a genre beside it. */
export function MovieRow({ movie, genre, onPress }: MovieRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={genre ? `${movie.title}, ${genre}` : movie.title}
      onPress={onPress}
      className="flex-row items-center gap-5 active:opacity-80"
    >
      {/* The navy shows while the image loads, and stays when TMDb has no backdrop for the movie */}
      <View className="h-[100px] w-[130px] overflow-hidden rounded-xl bg-navy">
        {movie.backdropPath && (
          <Image
            source={imageUrl(movie.backdropPath, 'thumbnail')}
            contentFit="cover"
            cachePolicy="memory-disk"
            // The list recycles rows, so a recycled one must not show the movie it held before
            recyclingKey={String(movie.id)}
            style={StyleSheet.absoluteFill}
            // The title beside it says what the image shows
            accessible={false}
          />
        )}
      </View>
      <View className="flex-1 gap-1">
        <Text variant="rowTitle" numberOfLines={2}>
          {movie.title}
        </Text>
        {genre && (
          <Text variant="rowDetail" numberOfLines={1}>
            {genre}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
