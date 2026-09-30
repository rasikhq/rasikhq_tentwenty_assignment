import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useColumnCount } from '../lib/layout';

type SkeletonGridProps = {
  /** What a screen reader says for the placeholders. */
  label: string;
  /** How many rows of placeholders to show. */
  rows: number;
  /** One placeholder, shaped like the item it stands in for. */
  children: ReactNode;
};

/** Placeholders for a list that is loading, in as many columns as the list has. */
export function SkeletonGrid({ label, rows, children }: SkeletonGridProps) {
  const columns = useColumnCount();

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      className="flex-row flex-wrap overflow-hidden"
    >
      {Array.from({ length: rows * columns }, (_, index) => (
        <View key={index} className={columns === 1 ? 'w-full' : 'w-1/2'}>
          {children}
        </View>
      ))}
    </View>
  );
}
