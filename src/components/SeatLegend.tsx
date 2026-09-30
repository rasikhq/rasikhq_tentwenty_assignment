import { View } from 'react-native';

import { SEAT_TYPES, type SeatType } from '../lib/hall';
import { SeatSwatch, type SeatTone } from './SeatSwatch';
import { Text } from './Text';

const SWATCH_SIZE = 16;

/** A seat type as the legend names it: "VIP ($150)". */
function priced(seatType: SeatType) {
  const { name, price } = SEAT_TYPES[seatType];
  return `${name} ($${price})`;
}

const entries: { tone: SeatTone; label: string }[] = [
  { tone: 'selected', label: 'Selected' },
  { tone: 'unavailable', label: 'Not available' },
  { tone: 'vip', label: priced('vip') },
  { tone: 'regular', label: priced('regular') },
];

type SeatLegendProps = {
  /** One row, for a wide or short window. Otherwise two rows of two. */
  compact: boolean;
};

/** What the seat map's four seat colours mean. */
export function SeatLegend({ compact }: SeatLegendProps) {
  return (
    <View className={`flex-row flex-wrap px-5 ${compact ? 'justify-center gap-x-6 py-2' : 'gap-y-3 py-3'}`}>
      {entries.map(({ tone, label }) => (
        <View key={tone} className={`flex-row items-center gap-2 ${compact ? '' : 'w-1/2'}`}>
          <SeatSwatch tone={tone} size={SWATCH_SIZE} />
          <Text variant="legend">{label}</Text>
        </View>
      ))}
    </View>
  );
}
