import type { ReactNode } from 'react';
import { View } from 'react-native';

import { columnWidthClass } from '../lib/layout';

type SkeletonGridProps = {
  /** What a screen reader says for the placeholders. */
  label: string;
  /** How many rows of placeholders to show. */
  rows: number;
  /** How many columns the list has. */
  columns: keyof typeof columnWidthClass;
  /** One placeholder, shaped like the item it stands in for. */
  children: ReactNode;
};

/** Placeholders for a list that is loading, in as many columns as the list has. */
export function SkeletonGrid({ label, rows, columns, children }: SkeletonGridProps) {
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      className="flex-row flex-wrap overflow-hidden"
    >
      {Array.from({ length: rows * columns }, (_, index) => (
        <View key={index} className={columnWidthClass[columns]}>
          {children}
        </View>
      ))}
    </View>
  );
}
