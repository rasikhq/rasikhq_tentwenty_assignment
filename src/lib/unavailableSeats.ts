import type { Seat } from './hall';
import type { Showtime } from './showtime';

// About one seat in this many is unavailable
const ONE_IN = 3;

/** A 32-bit hash of a text (FNV-1a): the same text always gives the same number. */
function hash(text: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/**
 * The ids of the seats that can't be picked for a showtime, about a third of them. Nothing is saved:
 * each seat is decided by a hash of the showtime's identity and the seat's own, so a showtime shows
 * the same unavailable seats on every visit, and another showtime shows others.
 */
export function unavailableSeatIds(showtime: Showtime, seats: Seat[]): Set<string> {
  const identity = `${showtime.movieId}|${showtime.hallId}|${showtime.date}|${showtime.time}`;
  return new Set(
    seats.filter((seat) => hash(`${identity}|${seat.id}`) % ONE_IN === 0).map((seat) => seat.id),
  );
}
