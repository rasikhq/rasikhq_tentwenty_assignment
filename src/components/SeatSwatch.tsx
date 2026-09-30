import { View } from 'react-native';

// What a seat's colour says about it
const tones = {
  regular: 'bg-sky',
  vip: 'bg-purple',
  unavailable: 'bg-light-grey',
  selected: 'bg-gold',
} as const;

export type SeatTone = keyof typeof tones;

type SeatSwatchProps = {
  tone: SeatTone;
  /** The width and height, in dp. */
  size: number;
};

// The parts of the Figma's seat, as shares of its size. The space between them is what they leave.
const BACK_HEIGHT = 0.74;
const BACK_RADIUS = 0.18;
const CUSHION_WIDTH = 0.7;
const CUSHION_HEIGHT = 0.18;

/**
 * A seat as the seat map and its legend draw it, in its tone's colour: the Figma's seat, a rounded
 * back with a narrower cushion under it.
 */
export function SeatSwatch({ tone, size }: SeatSwatchProps) {
  return (
    <View className="items-center justify-between" style={{ width: size, height: size }}>
      <View
        className={tones[tone]}
        style={{ width: size, height: size * BACK_HEIGHT, borderRadius: size * BACK_RADIUS }}
      />
      <View
        className={tones[tone]}
        style={{
          width: size * CUSHION_WIDTH,
          height: size * CUSHION_HEIGHT,
          borderRadius: (size * CUSHION_HEIGHT) / 2,
        }}
      />
    </View>
  );
}
