import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button } from './Button';
import { Text } from './Text';

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry: () => void;
  /** Sits in the flow, such as below a list, instead of filling and centring in its screen. */
  inline?: boolean;
  /** For a dark screen: the text goes white. */
  onDark?: boolean;
  /** Other ways forward, as buttons after Retry. */
  children?: ReactNode;
};

/** Shown when content failed to load: what failed, why, and a way to try again. */
export function ErrorState({ title, message, onRetry, inline = false, onDark = false, children }: ErrorStateProps) {
  return (
    <View className={`items-center gap-3 px-8 ${inline ? 'py-6' : 'flex-1 justify-center'}`}>
      <Text variant={onDark ? 'stateTitleOnDark' : 'stateTitle'}>{title}</Text>
      <Text variant={onDark ? 'stateMessageOnDark' : 'stateMessage'}>{message}</Text>
      {/* Side by side where they fit, which keeps the buttons on screen in a short landscape window */}
      <View className="flex-row flex-wrap justify-center gap-3 pt-2">
        <Button label="Retry" onPress={onRetry} />
        {children}
      </View>
    </View>
  );
}
