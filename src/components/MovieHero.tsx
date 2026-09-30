import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { imageUrl } from '../api/images';
import { Scrim } from './Scrim';
import { Text } from './Text';

type MovieHeroProps = {
  title: string;
  backdropPath: string | null;
  /** Under the title. */
  children?: ReactNode;
  /** Fills the height its parent gives it, instead of keeping the shape of a backdrop image. */
  fill?: boolean;
};

/** A movie's backdrop image with its title over a darkening gradient. */
export function MovieHero({ title, backdropPath, children, fill = false }: MovieHeroProps) {
  return (
    // The navy shows while the image loads, and stays when TMDb has no backdrop for the movie
    <View className={`overflow-hidden bg-navy ${fill ? 'flex-1' : 'aspect-[4/3]'}`}>
      {backdropPath && (
        <Image
          source={imageUrl(backdropPath, 'hero')}
          // The list already loaded the card's smaller image, so it shows at once while this one loads
          placeholder={{ uri: imageUrl(backdropPath, 'card') }}
          placeholderContentFit="cover"
          contentFit="cover"
          cachePolicy="memory-disk"
          style={StyleSheet.absoluteFill}
          // The title over it says what the image shows
          accessible={false}
        />
      )}
      <Scrim />
      {/* Beside a display cutout, the title clears it. The image itself runs under it. */}
      <View className="flex-1 pl-safe">
        <View className="flex-1 justify-end gap-1 p-5">
          <Text variant="heroTitle" accessibilityRole="header">
            {title}
          </Text>
          {children}
        </View>
      </View>
    </View>
  );
}
