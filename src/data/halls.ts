import type { Hall, SeatType, Segment } from '../lib/hall';

// Hall 1 is 22 seats wide where its rows are full: two side blocks of 5 and a centre block of 12
const SIDE_BLOCK = 5;
const CENTRE_BLOCK = 12;
const AISLE: Segment = { kind: 'gap', width: 1 };

/**
 * A row of Hall 1: three blocks split by two aisles. A row nearer the screen has shorter side blocks,
 * and empty space where their outer seats would be, so the aisles stay in line from row to row.
 */
function hall1Row(sideSeats: number, seatType: SeatType = 'regular'): Segment[] {
  const side: Segment = { kind: 'seats', seatType, count: sideSeats };
  const space: Segment = { kind: 'gap', width: SIDE_BLOCK - sideSeats };
  const centre: Segment = { kind: 'seats', seatType, count: CENTRE_BLOCK };
  return [space, side, AISLE, centre, AISLE, side, space];
}

/** The Figma's hall: 10 rows and 210 seats, the front rows shorter, the back row VIP. */
const hall1: Hall = {
  id: 'hall-1',
  name: 'Hall 1',
  rows: [
    hall1Row(3),
    hall1Row(4),
    hall1Row(4),
    hall1Row(4),
    hall1Row(5),
    hall1Row(5),
    hall1Row(5),
    hall1Row(5),
    hall1Row(5),
    hall1Row(5, 'vip'),
  ],
};

/** Every hall, by its id. A new hall is a new entry here and nothing else. */
export const HALLS: Record<string, Hall> = {
  [hall1.id]: hall1,
};

/** The hall every mock showtime plays in. */
export const MOCK_SHOWTIME_HALL_ID = hall1.id;
