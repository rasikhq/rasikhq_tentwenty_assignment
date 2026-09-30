import { View } from 'react-native';

import { Text } from './Text';

type EmptyStateProps = {
  title: string;
  message: string;
};

/** Shown when a load succeeded but has nothing to list: what is missing and what the user can do. */
export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 px-8 pt-24">
      <Text variant="stateTitle">{title}</Text>
      <Text variant="stateMessage">{message}</Text>
    </View>
  );
}
