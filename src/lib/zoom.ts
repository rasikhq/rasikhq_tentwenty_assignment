// A slot at fit is never larger than this, however wide the hall area
const MAX_FIT_SLOT_SIZE = 32;
// A zoomed slot is never larger than this: a touch target of the size Android recommends
const MAX_SLOT_SIZE = 48;
// How much larger than fit each level above it is
const ZOOM_FACTORS = [1.5, 2.25];

/**
 * The slot sizes the seat map's zoom steps through, smallest first, in dp. The first is fit: the
 * size at which the hall is as wide as the hall area. The rest are 1.5 and 2.25 times fit. Each
 * stops at a maximum, and a level that would be no larger than the one before it is left out. So
 * a hall area wide enough for full-size seats at fit has fewer levels.
 */
export function zoomSlotSizes(slotSizeToFit: number): number[] {
  const fit = Math.min(MAX_FIT_SLOT_SIZE, slotSizeToFit);
  const sizes = [fit];
  for (const factor of ZOOM_FACTORS) {
    const size = Math.min(MAX_SLOT_SIZE, fit * factor);
    if (size > sizes[sizes.length - 1]) sizes.push(size);
  }
  return sizes;
}
