import { View } from 'react-native';

import { Button } from './Button';
import { Text } from './Text';

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry: () => void;
  /** Sits in the flow, such as below a list, instead of filling and centring in its screen. */
  inline?: boolean;
};

/** Shown when content failed to load: what failed, why, and a way to try again. */
export function ErrorState({ title, message, onRetry, inline = false }: ErrorStateProps) {
  return (
    <View className={`items-center gap-3 px-8 ${inline ? 'py-6' : 'flex-1 justify-center'}`}>
      <Text variant="stateTitle">{title}</Text>
      <Text variant="stateMessage">{message}</Text>
      <View className="pt-2">
        <Button label="Retry" onPress={onRetry} />
      </View>
    </View>
  );
}
