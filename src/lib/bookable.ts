import { dayNumberOf, today } from './dates';

// How long a movie stays in theaters, and so bookable, after its release
const BOOKABLE_DAYS_AFTER_RELEASE = 60;

/**
 * Whether a movie is a bookable movie: its release date is in the future or within the last 60 days.
 * A movie with no release date is not.
 */
export function isBookable(releaseDate: string | null): boolean {
  if (releaseDate === null) return false;
  return today() - dayNumberOf(releaseDate) <= BOOKABLE_DAYS_AFTER_RELEASE;
}
