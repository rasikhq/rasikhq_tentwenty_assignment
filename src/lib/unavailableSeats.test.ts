import { HALLS } from '../data/halls';
import { layOutHall, seatsOf } from './hall';
import type { Showtime } from './showtime';
import { unavailableSeatIds } from './unavailableSeats';

const seats = seatsOf(layOutHall(HALLS['hall-1']));

const showtime: Showtime = { movieId: 603, hallId: 'hall-1', date: '2026-06-15', time: '12:30' };

/** The ids of a showtime's unavailable seats, in the hall's order. */
function unavailableFor(of: Showtime): string[] {
  const unavailable = unavailableSeatIds(of, seats);
  return seats.map((seat) => seat.id).filter((id) => unavailable.has(id));
}

test('a showtime has the same unavailable seats every time it is asked', () => {
  expect(unavailableFor({ ...showtime })).toEqual(unavailableFor(showtime));
});

test.each([
  ['another movie', { ...showtime, movieId: 604 }],
  ['another hall', { ...showtime, hallId: 'hall-2' }],
  ['another date', { ...showtime, date: '2026-06-16' }],
  ['another time', { ...showtime, time: '15:30' }],
])('a showtime of %s has its own unavailable seats', (_what, other) => {
  expect(unavailableFor(other)).not.toEqual(unavailableFor(showtime));
});

test('about a third of the seats are unavailable, whatever the showtime', () => {
  const shares = Array.from({ length: 50 }, (_, index) => {
    const unavailable = unavailableFor({ ...showtime, movieId: 1000 + index });
    return unavailable.length / seats.length;
  });

  // A third, give or take the spread of 210 seats each drawn on their own
  expect(Math.min(...shares)).toBeGreaterThan(0.2);
  expect(Math.max(...shares)).toBeLessThan(0.47);
});

test('unavailable seats are spread through the hall, not bunched in a row or a run of numbers', () => {
  const unavailable = unavailableSeatIds(showtime, seats);
  const rowsWithBoth = new Set<number>();
  for (let row = 1; row <= 10; row += 1) {
    const inRow = seats.filter((seat) => seat.row === row);
    const taken = inRow.filter((seat) => unavailable.has(seat.id)).length;
    if (taken > 0 && taken < inRow.length) rowsWithBoth.add(row);
  }

  expect(rowsWithBoth.size).toBe(10);
});

test('only seats of the hall come back as unavailable', () => {
  const ids = new Set(seats.map((seat) => seat.id));

  for (const id of unavailableSeatIds(showtime, seats)) {
    expect(ids.has(id)).toBe(true);
  }
});
