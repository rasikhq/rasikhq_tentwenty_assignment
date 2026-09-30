import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';

import { Text } from './Text';

const FADE_IN = 150;
const STAY = 1800;
const FADE_OUT = 300;

/**
 * A brief message over the bottom of its parent: it fades in, stays, fades out and is gone. It lies
 * over the content and takes no touches, so nothing moves when it comes or goes. It sits clear of
 * controls at the parent's bottom edge, such as the seat map's zoom controls. To show it again, the
 * parent renders it with a new `key`.
 */
export function Toast({ message }: { message: string }) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [isGone, setIsGone] = useState(false);

  useEffect(() => {
    // Nothing takes a screen reader's focus to a toast, so it is read out
    AccessibilityInfo.announceForAccessibility(message);
    const showing = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: FADE_IN, useNativeDriver: true }),
      Animated.delay(STAY),
      Animated.timing(opacity, { toValue: 0, duration: FADE_OUT, useNativeDriver: true }),
    ]);
    showing.start(({ finished }) => {
      if (finished) setIsGone(true);
    });
    return () => showing.stop();
  }, [opacity, message]);

  if (isGone) return null;

  return (
    <View pointerEvents="none" className="absolute bottom-16 left-5 right-5 items-center">
      <Animated.View style={{ opacity }}>
        <View className="rounded-full bg-navy px-4 py-2">
          <Text variant="toast">{message}</Text>
        </View>
      </Animated.View>
    </View>
  );
}
