import { useRef } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

/**
 * Keeps the visible centre of a scroll view in place along one axis when its content changes size,
 * as the seat map's hall does on zoom: the point of the content that was at the middle of the view
 * is scrolled back to the middle. Spread what it returns onto the ScrollView.
 */
export function useKeepCentre(axis: 'x' | 'y') {
  const ref = useRef<ScrollView>(null);
  // Along the axis, as the scroll view last reported them: how far it is scrolled, its own length and its content's
  const last = useRef({ offset: 0, viewport: 0, content: 0 });

  return {
    ref,
    // Every frame, so the offset is current when the content changes
    scrollEventThrottle: 16,
    onLayout: ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
      last.current.viewport = axis === 'x' ? layout.width : layout.height;
    },
    onScroll: ({ nativeEvent: { contentOffset } }: NativeSyntheticEvent<NativeScrollEvent>) => {
      last.current.offset = contentOffset[axis];
    },
    onContentSizeChange: (width: number, height: number) => {
      const content = axis === 'x' ? width : height;
      const { offset, viewport, content: contentBefore } = last.current;
      last.current.content = content;
      if (contentBefore === 0 || viewport === 0 || content === contentBefore) return;

      // How far along the content the middle of the view was, from 0 to 1
      const centre = (offset + viewport / 2) / contentBefore;
      const furthest = Math.max(0, content - viewport);
      const next = Math.min(furthest, Math.max(0, centre * content - viewport / 2));
      last.current.offset = next;
      // A frame later: the new size reaches JS before the native view has it, and until then Android
      // stops the scroll at the old content's end
      requestAnimationFrame(() => ref.current?.scrollTo({ [axis]: next, animated: false }));
    },
  };
}
