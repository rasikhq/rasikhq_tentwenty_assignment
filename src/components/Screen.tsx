import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from './Text';

type ScreenProps = {
  title: string;
  children?: ReactNode;
};

/**
 * A screen with the Figma header bar. Android draws edge-to-edge, so the header
 * pads for the status bar and both parts pad for the notch in landscape.
 * The bottom inset is left to the content: a list pads its scroll content so it
 * scrolls under the home indicator, and a fixed bottom bar pads itself.
 */
export function Screen({ title, children }: ScreenProps) {
  return (
    <View className="flex-1 bg-off-white">
      <View className="bg-white pt-safe px-safe">
        <View className="h-16 justify-center px-5">
          <Text variant="title" accessibilityRole="header">
            {title}
          </Text>
        </View>
      </View>
      <View className="flex-1 px-safe">{children}</View>
    </View>
  );
}
