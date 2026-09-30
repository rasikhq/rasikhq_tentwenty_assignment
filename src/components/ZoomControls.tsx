import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Minus } from './icons/Minus';
import { Plus } from './icons/Plus';

/**
 * The room the controls take at the bottom of their parent: their height and the space above and
 * below them. Content that scrolls under them pads its end by this much, so nothing stays covered.
 */
export const ZOOM_CONTROLS_ROOM = 64;

type ZoomButtonProps = {
  label: string;
  disabled: boolean;
  onPress: () => void;
  children: ReactNode;
};

function ZoomButton({ label, disabled, onPress, children }: ZoomButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      // The button shows 40 dp across and takes touches across 48
      hitSlop={4}
      className={`h-10 w-10 items-center justify-center rounded-full border border-light-grey bg-white active:opacity-80 ${disabled ? 'opacity-50' : ''}`}
    >
      {children}
    </Pressable>
  );
}

type ZoomControlsProps = {
  canZoomOut: boolean;
  canZoomIn: boolean;
  onZoomOut: () => void;
  onZoomIn: () => void;
};

/** The − and + buttons of the seat map's zoom, over the bottom right of their parent. */
export function ZoomControls({ canZoomOut, canZoomIn, onZoomOut, onZoomIn }: ZoomControlsProps) {
  return (
    <View className="absolute bottom-3 right-4 flex-row gap-2">
      <ZoomButton label="Zoom out" disabled={!canZoomOut} onPress={onZoomOut}>
        <Minus />
      </ZoomButton>
      <ZoomButton label="Zoom in" disabled={!canZoomIn} onPress={onZoomIn}>
        <Plus />
      </ZoomButton>
    </View>
  );
}
