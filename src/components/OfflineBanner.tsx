import { View } from 'react-native';

import { Text } from './Text';

/** A slim note above saved content: the screen shows the last copy the app saved, not live data. */
export function OfflineBanner() {
  return (
    <View accessibilityRole="alert" className="bg-navy px-4 py-2">
      <Text variant="banner">{"You're offline. Showing saved movies."}</Text>
    </View>
  );
}
