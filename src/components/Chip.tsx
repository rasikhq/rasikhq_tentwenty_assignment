import { View } from 'react-native';

import { Text } from './Text';

// The Figma's chip colours, in the order chips cycle through them. Each states the text that reads on
// it: white on teal, pink or gold falls short of a readable contrast, ink on purple does too.
const tones = [
  { box: 'bg-teal', text: 'chipOnLight' },
  { box: 'bg-pink', text: 'chipOnLight' },
  { box: 'bg-purple', text: 'chipOnDark' },
  { box: 'bg-gold', text: 'chipOnLight' },
] as const;

type ChipProps = {
  label: string;
  /** The chip's place in its row, which picks its colour: teal, pink, purple, gold, then round again. */
  index: number;
};

/** A small coloured label, such as a genre. */
export function Chip({ label, index }: ChipProps) {
  const tone = tones[index % tones.length];
  return (
    <View className={`rounded-full px-4 py-1.5 ${tone.box}`}>
      <Text variant={tone.text}>{label}</Text>
    </View>
  );
}
