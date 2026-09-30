import { View } from 'react-native';

import type { HallRow, Seat } from '../lib/hall';
import { ScreenArc } from './ScreenArc';
import { SeatView } from './SeatView';
import { Text } from './Text';

// The room a row's number takes at each end of the row, so the seats stay centred
const ROW_NUMBER_WIDTH = 16;

/** How many slots wide a hall is: as many as its longest row has. */
function slotsAcross(rows: HallRow[]) {
  return Math.max(...rows.map((row) => row.slots.length));
}

/** The slot size at which a hall is exactly as wide as the width given, in dp. */
export function slotSizeToFit(rows: HallRow[], width: number) {
  return (width - 2 * ROW_NUMBER_WIDTH) / slotsAcross(rows);
}

type HallViewProps = {
  rows: HallRow[];
  /** The width and height of every slot, a seat or a gap, in dp. It sets how large the hall is. */
  slotSize: number;
  unavailableIds: Set<string>;
  selectedIds: Set<string>;
  /** Must stay the same function between renders: see SeatView. */
  onToggleSeat: (seat: Seat) => void;
};

/** A hall's seat layout, from the screen back: the screen's arc, then each row with its number. */
export function HallView({ rows, slotSize, unavailableIds, selectedIds, onToggleSeat }: HallViewProps) {
  return (
    <View className="items-center gap-3">
      <ScreenArc width={slotsAcross(rows) * slotSize} />
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
