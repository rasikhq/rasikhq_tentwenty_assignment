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

/** A seat as the seat map and its legend draw it: a block in its tone's colour, rounder at the back. */
export function SeatSwatch({ tone, size }: SeatSwatchProps) {
  return (
    <View
      className={tones[tone]}
      style={{
        width: size,
        height: size,
        borderTopLeftRadius: size * 0.4,
        borderTopRightRadius: size * 0.4,
        borderBottomLeftRadius: size * 0.15,
        borderBottomRightRadius: size * 0.15,
      }}
    />
  );
}
