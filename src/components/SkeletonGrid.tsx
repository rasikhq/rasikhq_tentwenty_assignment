import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useColumnCount } from '../lib/layout';

type SkeletonGridProps = {
  /** What a screen reader says for the placeholders. */
  label: string;
  /** How many rows of placeholders to show. */
  rows: number;
  /** How many columns the list has, for a list that isn't one of movies. */
  columns?: 1 | 2 | 4;
  /** One placeholder, shaped like the item it stands in for. */
  children: ReactNode;
};

const widths = { 1: 'w-full', 2: 'w-1/2', 4: 'w-1/4' };

/** Placeholders for a list that is loading, in as many columns as the list has: a list of movies, unless told. */
export function SkeletonGrid({ label, rows, columns, children }: SkeletonGridProps) {
  const movieColumns = useColumnCount();
  const count = columns ?? movieColumns;

  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      className="flex-row flex-wrap overflow-hidden"
    >
      {Array.from({ length: rows * count }, (_, index) => (
        <View key={index} className={widths[count]}>
          {children}
        </View>
      ))}
    </View>
  );
}
