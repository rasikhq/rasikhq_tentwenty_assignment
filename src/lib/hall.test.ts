import { layOutHall, seatsOf, type Hall, type Segment } from './hall';

function hallWith(...rows: Segment[][]): Hall {
  return { id: 'test-hall', name: 'Test Hall', rows };
}

/** Each row as its seat numbers, with a dot where a gap leaves a slot empty. */
function numbersOf(hall: Hall): string[] {
  return layOutHall(hall).map((row) => row.slots.map((seat) => seat?.number ?? '.').join(' '));
}

test('seats are numbered from 1 within their row', () => {
  const hall = hallWith([{ kind: 'seats', seatType: 'regular', count: 4 }]);

  expect(numbersOf(hall)).toEqual(['1 2 3 4']);
});

test('numbering carries on across a gap, which leaves its slots empty', () => {
  const hall = hallWith([
    { kind: 'seats', seatType: 'regular', count: 2 },
    { kind: 'gap', width: 1 },
    { kind: 'seats', seatType: 'regular', count: 3 },
  ]);

  expect(numbersOf(hall)).toEqual(['1 2 . 3 4 5']);
});

test('a gap at the start or end of a row takes slots and no numbers', () => {
  const hall = hallWith([
    { kind: 'gap', width: 2 },
    { kind: 'seats', seatType: 'regular', count: 2 },
    { kind: 'gap', width: 1 },
  ]);

  expect(numbersOf(hall)).toEqual(['. . 1 2 .']);
});

test('every row starts again at seat 1', () => {
  const hall = hallWith(
    [{ kind: 'seats', seatType: 'regular', count: 2 }],
    [
      { kind: 'gap', width: 1 },
      { kind: 'seats', seatType: 'regular', count: 3 },
    ],
  );

  expect(numbersOf(hall)).toEqual(['1 2', '. 1 2 3']);
});

test('rows are numbered from 1, in the order the hall lists them', () => {
  const hall = hallWith(
    [{ kind: 'seats', seatType: 'regular', count: 1 }],
    [{ kind: 'seats', seatType: 'regular', count: 1 }],
    [{ kind: 'seats', seatType: 'regular', count: 1 }],
  );

  expect(layOutHall(hall).map((row) => row.row)).toEqual([1, 2, 3]);
});

test('a seat knows its row, its number and the seat type of its segment', () => {
  const hall = hallWith(
    [{ kind: 'seats', seatType: 'regular', count: 1 }],
    [
      { kind: 'seats', seatType: 'regular', count: 1 },
      { kind: 'gap', width: 1 },
      { kind: 'seats', seatType: 'vip', count: 1 },
    ],
  );

  const [, secondRow] = layOutHall(hall);

  expect(secondRow.slots).toEqual([
    { id: '2-1', row: 2, number: 1, seatType: 'regular' },
    null,
    { id: '2-2', row: 2, number: 2, seatType: 'vip' },
  ]);
});

test('no two seats of a hall share an id', () => {
  const hall = hallWith(
    [{ kind: 'seats', seatType: 'regular', count: 12 }],
    [{ kind: 'seats', seatType: 'regular', count: 12 }],
  );

  const ids = seatsOf(layOutHall(hall)).map((seat) => seat.id);

  expect(new Set(ids).size).toBe(24);
});

test('a row with no seats stays in the layout as an empty row', () => {
  const hall = hallWith([{ kind: 'gap', width: 3 }], [{ kind: 'seats', seatType: 'regular', count: 1 }]);

  expect(numbersOf(hall)).toEqual(['. . .', '1']);
});

test('the seats of a hall are its rows\' seats in order, without the gaps', () => {
  const hall = hallWith(
    [
      { kind: 'gap', width: 1 },
      { kind: 'seats', seatType: 'regular', count: 2 },
    ],
    [
      { kind: 'seats', seatType: 'vip', count: 1 },
      { kind: 'gap', width: 1 },
      { kind: 'seats', seatType: 'vip', count: 1 },
    ],
  );

  expect(seatsOf(layOutHall(hall)).map((seat) => seat.id)).toEqual(['1-1', '1-2', '2-1', '2-2']);
});
