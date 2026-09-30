import { DAY } from './duration';

/**
 * The number of calendar days from 1 January 1970 to a date, so two dates subtract to whole days
 * whatever daylight saving does between them.
 */
function dayNumber(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day) / DAY;
}

// A TMDb date such as "2021-12-22" as its year, month and day
function parseDate(date: string): [year: number, month: number, day: number] {
  const [year, month, day] = date.split('-').map(Number);
  return [year, month, day];
}

/** The calendar day of a TMDb date such as "2021-12-22", as a day number. */
export function dayNumberOf(date: string): number {
  return dayNumber(...parseDate(date));
}

/** Today's calendar day on this device, as a day number. */
export function todayDayNumber(): number {
  const now = new Date();
  return dayNumber(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Today's calendar day on this device, written as TMDb writes dates: "2021-12-22". */
export function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** A TMDb date such as "2021-12-22" the way the app writes dates: "December 22, 2021". */
export function formatDate(date: string): string {
  const [year, month, day] = parseDate(date);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}
