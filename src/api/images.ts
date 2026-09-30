const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Each place an image appears (a slot) asks TMDb for a size that stays sharp there, never `original`
const sizes = {
  card: 'w780',
  hero: 'w1280',
  strip: 'w500',
} as const;

export type ImageSlot = keyof typeof sizes;

/** The URL of a TMDb image file for the slot it will fill. TMDb file paths start with a slash. */
export function imageUrl(path: string, slot: ImageSlot): string {
  return `${IMAGE_BASE_URL}/${sizes[slot]}${path}`;
}
