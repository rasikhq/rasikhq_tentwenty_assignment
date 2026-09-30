import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { imageUrl } from '../api/images';
import type { Movie } from '../api/types';
import { Scrim } from './Scrim';
import { Text } from './Text';

type MovieCardProps = {
  movie: Movie;
  onPress: () => void;
};

/** A movie as a large card: the backdrop image with its title over a darkening gradient. */
export function MovieCard({ movie, onPress }: MovieCardProps) {
  return (
    // The navy shows while the image loads, and stays when TMDb has no backdrop for the movie
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="aspect-video overflow-hidden rounded-2xl bg-navy active:opacity-80"
    >
      {movie.backdropPath && (
        <Image
          source={imageUrl(movie.backdropPath, 'card')}
          contentFit="cover"
          // Kept in memory and on disk, so a backdrop seen once still shows offline
          cachePolicy="memory-disk"
          // The list recycles cards, so a recycled one must not show the movie it held before
          recyclingKey={String(movie.id)}
          style={StyleSheet.absoluteFill}
          // The title beside it says what the image shows
          accessible={false}
        />
      )}
      <Scrim />
      <View className="flex-1 justify-end p-4">
        <Text variant="cardTitle" numberOfLines={2}>
          {movie.title}
        </Text>
      </View>
    </Pressable>
  );
}
