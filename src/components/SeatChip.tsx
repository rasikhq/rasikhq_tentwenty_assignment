import { Pressable, View } from 'react-native';

import type { Seat } from '../lib/hall';
import { Cross } from './icons/Cross';
import { Text } from './Text';

type SeatChipProps = {
  seat: Seat;
  onRemove: () => void;
};

/** A seat of the selection: "<seat> / <row> row", with a button that takes the seat out. */
export function SeatChip({ seat, onRemove }: SeatChipProps) {
  return (
    <View className="h-8 flex-row items-center rounded-lg bg-light-grey pl-3">
      <Text variant="chipOnLight">{`${seat.number} / ${seat.row} row`}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove seat ${seat.number}, row ${seat.row}`}
        onPress={onRemove}
        // The cross is small, so the button reaches past the chip's top and bottom for a finger
        hitSlop={{ top: 8, bottom: 8, right: 4 }}
        className="h-8 w-8 items-center justify-center active:opacity-60"
      >
        <Cross small />
      </Pressable>
    </View>
  );
}
