import { View } from 'react-native';

import type { HallRow, Seat } from '../lib/hall';
import { ScreenArc } from './ScreenArc';
import { SeatView } from './SeatView';
import { Text } from './Text';

// The room a row's number takes at each end of the row, so the seats stay centred
const ROW_NUMBER_WIDTH = 16;
// A slot is never larger than this, however wide the window
const MAX_SLOT_SIZE = 32;

type HallViewProps = {
  rows: HallRow[];
  /** The width the hall fits into, in dp. */
  width: number;
  unavailableIds: Set<string>;
  selectedIds: Set<string>;
  /** Must stay the same function between renders: see SeatView. */
  onToggleSeat: (seat: Seat) => void;
};

/** A hall's seat layout, from the screen back: the screen's arc, then each row with its number. */
export function HallView({ rows, width, unavailableIds, selectedIds, onToggleSeat }: HallViewProps) {
  const slotsAcross = Math.max(...rows.map((row) => row.slots.length));
  // Every slot is a square this size, a seat or a gap, so the hall fits the width it is given
  const slotSize = Math.min(MAX_SLOT_SIZE, (width - 2 * ROW_NUMBER_WIDTH) / slotsAcross);

  return (
    <View className="items-center gap-3">
      <ScreenArc width={slotsAcross * slotSize} />
      <View>
        {rows.map((row) => (
          <View key={row.row} className="flex-row items-center" style={{ height: slotSize }}>
            <View style={{ width: ROW_NUMBER_WIDTH }}>
              <Text variant="hallLabel">{row.row}</Text>
            </View>
            {row.slots.map((seat, slot) =>
              seat ? (
                <SeatView
                  key={seat.id}
                  seat={seat}
                  slotSize={slotSize}
                  isUnavailable={unavailableIds.has(seat.id)}
                  isSelected={selectedIds.has(seat.id)}
                  onToggle={onToggleSeat}
                />
              ) : (
                <View key={`gap-${slot}`} style={{ width: slotSize }} />
              ),
            )}
            <View style={{ width: ROW_NUMBER_WIDTH }} />
          </View>
        ))}
      </View>
    </View>
  );
}
