import { View } from 'react-native';

import { Text } from './Text';

// The line's thickness, and how far its ends sit below its middle as a share of its width
const STROKE = 3;
const RISE_SHARE = 0.06;

/**
 * The cinema screen at the front of a hall: a shallow arc with "SCREEN" under it. The arc is the top
 * of a large circle's outline, with everything below its ends clipped away.
 */
export function ScreenArc({ width }: { width: number }) {
  const rise = width * RISE_SHARE;
  // The circle whose arc spans this width and rises this far
  const radius = (width * width) / (8 * rise) + rise / 2;

  return (
    <View className="items-center gap-1">
      <View className="overflow-hidden" style={{ width, height: rise + STROKE }}>
        <View
          className="absolute border-sky"
          style={{
            top: 0,
            left: width / 2 - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            borderWidth: STROKE,
          }}
        />
      </View>
      <Text variant="hallLabel">SCREEN</Text>
    </View>
  );
}
