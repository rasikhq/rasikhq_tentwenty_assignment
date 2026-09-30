import { MOCK_SHOWTIME_HALL_ID } from '../data/halls';
import { dayNumberOf, today, todayDayNumber } from './dates';

/** A movie scheduled at a specific date, time and hall. */
export type Showtime = {
  movieId: number;
  hallId: string;
  /** The day it plays, written as TMDb writes dates: "2021-12-22". */
  date: string;
  /** When it starts that day, on the 24-hour clock: "12:30". */
  time: string;
};

const MOCK_SHOWTIME_TIME = '12:30';

/**
 * The one mock showtime of a bookable movie: at 12:30 in Hall 1, today, or on the release date when the
 * movie isn't out yet.
 */
export function showtimeFor(movieId: number, releaseDate: string): Showtime {
  const isReleased = dayNumberOf(releaseDate) <= todayDayNumber();
  return {
    movieId,
    hallId: MOCK_SHOWTIME_HALL_ID,
    date: isReleased ? today() : releaseDate,
    time: MOCK_SHOWTIME_TIME,
  };
}
