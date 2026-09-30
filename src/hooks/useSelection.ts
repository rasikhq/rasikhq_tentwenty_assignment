import { useCallback, useReducer } from 'react';

import type { Seat } from '../lib/hall';

/** The most seats a selection holds. */
export const MAX_SELECTION = 8;

type Selection = {
  /** The seats the user picked, in the order they picked them. */
  seats: Seat[];
  /** How many times a seat was refused because the selection was full. */
  refusals: number;
};

type Action = { type: 'toggle'; seat: Seat } | { type: 'remove'; seat: Seat };

function reduce(selection: Selection, { type, seat }: Action): Selection {
  if (selection.seats.some((selected) => selected.id === seat.id)) {
    return { ...selection, seats: selection.seats.filter((selected) => selected.id !== seat.id) };
  }
  // The seat already left the selection, such as on a second tap of its remove button
  if (type === 'remove') return selection;
  if (selection.seats.length >= MAX_SELECTION) {
    return { ...selection, refusals: selection.refusals + 1 };
  }
  return { ...selection, seats: [...selection.seats, seat] };
}

/**
 * The selection on the seat map: up to 8 seats. It lives in the screen, so it is gone when the user
 * leaves. `toggle` and `remove` stay the same functions between renders, which the memoized seats rely on.
 */
export function useSelection() {
  const [selection, dispatch] = useReducer(reduce, { seats: [], refusals: 0 });
  /** Adds an unselected seat, or takes a selected one out. A seat beyond the maximum is refused. */
  const toggle = useCallback((seat: Seat) => dispatch({ type: 'toggle', seat }), []);
  /** Takes a seat out of the selection. */
  const remove = useCallback((seat: Seat) => dispatch({ type: 'remove', seat }), []);

  return { ...selection, toggle, remove };
}
