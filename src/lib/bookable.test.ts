import { controlDate } from '../test/clock';
import { isBookable } from './bookable';

// Local noon, so today is the same calendar day wherever the tests run
function setToday(year: number, month: number, day: number) {
  controlDate();
  jest.setSystemTime(new Date(year, month - 1, day, 12));
}

describe('with today at 15 June 2026', () => {
  beforeEach(() => setToday(2026, 6, 15));

  test.each([
    ['months ahead', '2026-09-01'],
    ['tomorrow', '2026-06-16'],
    ['today', '2026-06-15'],
    ['yesterday', '2026-06-14'],
    ['60 days ago', '2026-04-16'],
  ])('a movie released %s is a bookable movie', (_when, releaseDate) => {
    expect(isBookable(releaseDate)).toBe(true);
  });

  test.each([
    ['61 days ago', '2026-04-15'],
    ['years ago', '2021-12-22'],
  ])('a movie released %s is not a bookable movie', (_when, releaseDate) => {
    expect(isBookable(releaseDate)).toBe(false);
  });

  test('a movie with no release date is not a bookable movie', () => {
    expect(isBookable(null)).toBe(false);
  });
});

describe('with today at 20 January 2026', () => {
  beforeEach(() => setToday(2026, 1, 20));

  test('the 60 days count back across the new year', () => {
    expect(isBookable('2025-11-21')).toBe(true);
    expect(isBookable('2025-11-20')).toBe(false);
  });
});
