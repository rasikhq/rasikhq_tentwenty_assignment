import { Image } from 'expo-image';
import { FlatList, StyleSheet, View } from 'react-native';

import { imageUrl } from '../api/images';

/** A row of a movie's images, scrolling sideways. Its container pads it, so it runs edge to edge. */
export function ImageStrip({ paths }: { paths: string[] }) {
  return (
    <FlatList
      accessibilityLabel="Movie images"
      horizontal
      showsHorizontalScrollIndicator={false}
      data={paths}
      keyExtractor={(path) => path}
      contentContainerClassName="gap-3 px-5"
      renderItem={({ item }) => (
        // The navy shows while the image loads
        <View className="aspect-video w-[200px] overflow-hidden rounded-xl bg-navy">
          <Image
            source={imageUrl(item, 'strip')}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={StyleSheet.absoluteFill}
            // Decoration: the overview says what the movie is about
            accessible={false}
          />
        </View>
      )}
    />
  );
}
