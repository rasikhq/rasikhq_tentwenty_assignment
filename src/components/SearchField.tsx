import { Pressable, TextInput, View } from 'react-native';

import { Cross } from './icons/Cross';
import { Magnifier } from './icons/Magnifier';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  /** Leaves Search. The field's button does this when there is no text to clear. */
  onClose: () => void;
};

/**
 * The Figma's search field: a pill with the search icon, the text, and one button. The button clears the
 * text when there is text and closes Search when the field is empty.
 */
export function SearchField({ value, onChangeText, onClose }: SearchFieldProps) {
  const hasText = value !== '';

  return (
    <View className="h-12 flex-1 flex-row items-center rounded-full bg-off-white pl-4">
      <Magnifier />
      {/* Not focused on open, so the keyboard doesn't cover what Search shows before any typing */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search movies"
        accessibilityLabel="Search movies"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        // A font size without the line height of text-sm, which iOS adds below the text of an input.
        // Android pads an input by itself, which would push the text off centre.
        className="flex-1 px-3 py-0 font-poppins text-[14px] text-ink placeholder:text-grey"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hasText ? 'Clear search' : 'Close search'}
        onPress={hasText ? () => onChangeText('') : onClose}
        className="h-12 w-12 items-center justify-center rounded-full active:opacity-80"
      >
        <Cross />
      </Pressable>
    </View>
  );
}
