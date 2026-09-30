import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

/**
 * A light grey block that pulses gently while content loads. The caller shapes it with class names
 * so it matches the content it stands in for.
 */
export function Skeleton({ className }: { className: string }) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <View className={`bg-light-grey ${className}`} />
    </Animated.View>
  );
}
