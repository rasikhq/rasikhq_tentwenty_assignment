import { useRef } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

/**
 * Keeps the visible centre of a scroll view in place along one axis while its content changes size,
 * as the seat map's hall does on zoom. Spread `scrollViewProps` onto the ScrollView, and call
 * `holdCentre()` just before the change: once the content has its new size, the point of it that
 * was at the middle of the view is scrolled back to the middle.
 */
export function useKeepCentre(axis: 'x' | 'y') {
  const length = axis === 'x' ? 'width' : 'height';
  const ref = useRef<ScrollView>(null);
  // Along the axis, as the scroll view last reported them: how far it is scrolled, its own length and its content's
  const last = useRef({ offset: 0, viewport: 0, content: 0 });
  // How far along the content the middle of the view was when the centre was held, from 0 to 1
  const held = useRef<number | null>(null);

  return {
    holdCentre: () => {
      const { offset, viewport, content } = last.current;
      held.current = viewport > 0 && content > 0 ? (offset + viewport / 2) / content : null;
    },
    scrollViewProps: {
      ref,
      // Every frame, so the offset is current when the centre is held
      scrollEventThrottle: 16,
      onLayout: ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
        // A held centre belongs to the view as it was: a view that changes size itself, as on
        // rotation, lets it go
        if (layout[length] !== last.current.viewport) held.current = null;
        last.current.viewport = layout[length];
      },
      onScroll: ({ nativeEvent: { contentOffset } }: NativeSyntheticEvent<NativeScrollEvent>) => {
        last.current.offset = contentOffset[axis];
      },
      onContentSizeChange: (width: number, height: number) => {
        const content = axis === 'x' ? width : height;
        last.current.content = content;
        const centre = held.current;
        if (centre === null) return;
        held.current = null;

        const { viewport } = last.current;
        const furthest = Math.max(0, content - viewport);
        const offset = Math.min(furthest, Math.max(0, centre * content - viewport / 2));
        last.current.offset = offset;
        // A frame later: the new size reaches JS before the native view has it, and until then
        // Android stops the scroll at the old content's end
        requestAnimationFrame(() => ref.current?.scrollTo({ [axis]: offset, animated: false }));
      },
    },
  };
}
