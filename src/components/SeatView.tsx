import { memo } from 'react';
import { Pressable } from 'react-native';

import { SEAT_TYPES, type Seat } from '../lib/hall';
import { SeatSwatch } from './SeatSwatch';

// How much of its slot a seat fills. The rest is the space between seats, which still takes the tap.
const SEAT_SHARE_OF_SLOT = 0.8;

type SeatViewProps = {
  seat: Seat;
  /** The width and height of the seat's slot in its row, in dp. */
  slotSize: number;
  isUnavailable: boolean;
  isSelected: boolean;
  /** Must stay the same function between renders, or every seat renders again on each change. */
  onToggle: (seat: Seat) => void;
};

/**
 * One seat of the seat map. Memoized: a change to the selection re-renders only the seats whose
 * own props changed, not all of the hall.
 */
export const SeatView = memo(function SeatView({
  seat,
  slotSize,
  isUnavailable,
  isSelected,
  onToggle,
}: SeatViewProps) {
  const { name, price } = SEAT_TYPES[seat.seatType];
  const availability = isUnavailable ? 'unavailable' : 'available';
  const tone = isUnavailable ? 'unavailable' : isSelected ? 'selected' : seat.seatType;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Row ${seat.row}, seat ${seat.number}, ${name}, ${price} dollars, ${availability}`}
      accessibilityState={{ selected: isSelected, disabled: isUnavailable }}
      disabled={isUnavailable}
      onPress={() => onToggle(seat)}
      className="items-center justify-center"
      style={{ width: slotSize, height: slotSize }}
    >
      <SeatSwatch tone={tone} size={slotSize * SEAT_SHARE_OF_SLOT} />
    </Pressable>
  );
});
