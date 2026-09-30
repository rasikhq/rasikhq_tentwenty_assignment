/** The kind of seat, which sets its price. */
export type SeatType = 'regular' | 'vip';

/** What each seat type is called and costs, in dollars. */
export const SEAT_TYPES: Record<SeatType, { name: string; price: number }> = {
  regular: { name: 'Regular', price: 50 },
  vip: { name: 'VIP', price: 150 },
};

/**
 * A stretch of a row: a run of seats of one seat type, or a gap (an aisle, or empty space beside a
 * shorter row) as wide as that many seats.
 */
export type Segment =
  | { kind: 'seats'; seatType: SeatType; count: number }
  | { kind: 'gap'; width: number };

/** A room in the cinema. Its layout is its rows, from the screen back, each a list of segments. */
export type Hall = {
  id: string;
  name: string;
  rows: Segment[][];
};

/** A single place in a hall, identified by its row and its number in that row. */
export type Seat = {
  /** Unique within its hall. */
  id: string;
  row: number;
  number: number;
  seatType: SeatType;
};

/** A row of a hall as the seat map draws it: a line of seat-wide slots, each a seat, or null where a gap leaves it empty. */
export type HallRow = {
  row: number;
  slots: (Seat | null)[];
};

/**
 * Turns a hall's layout into its numbered seats. Rows are numbered from 1 in the hall's order. Seats
 * are numbered from 1 within their row, and a gap takes slots but no numbers.
 */
export function layOutHall(hall: Hall): HallRow[] {
  return hall.rows.map((segments, rowIndex) => {
    const row = rowIndex + 1;
    const slots: (Seat | null)[] = [];
    let number = 0;
    for (const segment of segments) {
      if (segment.kind === 'gap') {
        for (let slot = 0; slot < segment.width; slot += 1) slots.push(null);
        continue;
      }
      for (let seat = 0; seat < segment.count; seat += 1) {
        number += 1;
        slots.push({ id: `${row}-${number}`, row, number, seatType: segment.seatType });
      }
    }
    return { row, slots };
  });
}

/** Every seat of a laid-out hall, row by row. */
export function seatsOf(rows: HallRow[]): Seat[] {
  return rows.flatMap((row) => row.slots.filter((seat) => seat !== null));
}
