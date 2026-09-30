import { useState } from 'react';

import { zoomSlotSizes } from '../lib/zoom';

/**
 * The seat map's zoom: which of its levels the hall is laid out at. It starts at fit. The levels
 * follow the size that fits, so they change when the hall area does, such as on rotation.
 */
export function useZoom(slotSizeToFit: number) {
  const [chosenLevel, setChosenLevel] = useState(0);
  const sizes = zoomSlotSizes(slotSizeToFit);
  // A wider hall area can have fewer levels than the one the level was chosen in
  const level = Math.min(chosenLevel, sizes.length - 1);

  return {
    /** The width and height of a seat's slot at this level, in dp. */
    slotSize: sizes[level],
    canZoomOut: level > 0,
    canZoomIn: level < sizes.length - 1,
    zoomOut: () => setChosenLevel(level - 1),
    zoomIn: () => setChosenLevel(level + 1),
  };
}
