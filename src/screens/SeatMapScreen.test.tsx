import { screen, userEvent, waitForElementToBeRemoved } from '@testing-library/react-native';

import { controlDate } from '../test/clock';
import { renderApp } from '../test/renderApp';
import { serveMovieDetail, serveUpcoming, tmdbMovie, tmdbMovieDetail } from '../test/tmdb';
import { rotateToLandscape } from '../test/window';

/**
 * Opens the app on Movie list, opens a bookable movie's detail and taps Get Tickets. Unless a test says
 * otherwise, the movie comes out far enough ahead to stay bookable for as long as the tests are run.
 */
async function openSeatMap(overrides: Parameters<typeof tmdbMovieDetail>[0] = {}) {
  const user = userEvent.setup();
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', release_date: '2099-12-22', ...overrides });
  serveUpcoming([[tmdbMovie({ id: detail.id, title: detail.title })]]);
  serveMovieDetail(detail);
  await renderApp();
  await user.press(await screen.findByRole('button', { name: detail.title }));
  await user.press(await screen.findByRole('button', { name: 'Get Tickets' }));
  return user;
}

test('Get Tickets opens the seat map for a showtime on the release date of a movie that is not out yet, at 12:30 in Hall 1', async () => {
  await openSeatMap({ title: 'Dune: Part Three', release_date: '2099-12-22' });

  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
  expect(screen.getByText('December 22, 2099 | 12:30 Hall 1')).toBeOnTheScreen();
});

test('the showtime of a movie already in theaters is today', async () => {
  controlDate();
  // Local noon, so today is the same calendar day wherever the tests run
  jest.setSystemTime(new Date(2026, 5, 15, 12));

  await openSeatMap({ release_date: '2026-06-01' });

  expect(screen.getByText('June 15, 2026 | 12:30 Hall 1')).toBeOnTheScreen();
});

/** The seats of the hall that can be picked, in the hall's order. */
function availableSeats() {
  return screen.getAllByRole('button', { name: /, available$/ });
}

/** Where a seat is, read from what it says of itself: "Row 3, seat 4, ..." */
function placeOf(seat: ReturnType<typeof availableSeats>[number]) {
  const [, row, number] = /^Row (\d+), seat (\d+),/.exec(seat.props.accessibilityLabel as string)!;
  return { row, number };
}

/** The seats of the hall that someone else already has, in the hall's order. */
function unavailableSeats() {
  return screen.getAllByRole('button', { name: /, unavailable$/ });
}

test('the seat map shows Hall 1: the screen, 10 numbered rows, and every seat with its row, number, seat type and price', async () => {
  await openSeatMap();

  expect(screen.getByText('SCREEN')).toBeOnTheScreen();
  for (let row = 1; row <= 10; row += 1) {
    expect(screen.getByText(String(row))).toBeOnTheScreen();
  }
  expect(availableSeats().length + unavailableSeats().length).toBe(210);
  // The front row is shorter than the rows behind it, and the back row is VIP
  expect(screen.getByRole('button', { name: /^Row 1, seat 18, Regular, 50 dollars, (un)?available$/ })).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: /^Row 1, seat 19, / })).not.toBeOnTheScreen();
  expect(screen.getByRole('button', { name: /^Row 9, seat 22, Regular, 50 dollars, (un)?available$/ })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: /^Row 10, seat 22, VIP, 150 dollars, (un)?available$/ })).toBeOnTheScreen();
});

test('tapping an available seat adds it to the selection, and tapping it again takes it out', async () => {
  const user = await openSeatMap();
  const [seat] = availableSeats();
  expect(seat).not.toBeSelected();

  await user.press(seat);

  expect(seat).toBeSelected();

  await user.press(seat);

  expect(seat).not.toBeSelected();
});

test('an unavailable seat is disabled and ignores taps', async () => {
  const user = await openSeatMap();
  const [seat] = unavailableSeats();
  expect(seat).toBeDisabled();

  await user.press(seat);

  expect(seat).not.toBeSelected();
  expect(screen.queryByRole('button', { selected: true })).not.toBeOnTheScreen();
});

test('about a third of the seats are unavailable, and the same ones on every visit to a showtime', async () => {
  const user = await openSeatMap();
  const labels = () => unavailableSeats().map((seat) => seat.props.accessibilityLabel as string);
  const onFirstVisit = labels();
  expect(onFirstVisit.length).toBeGreaterThan(210 / 5);
  expect(onFirstVisit.length).toBeLessThan(210 / 2);

  await user.press(screen.getByRole('button', { name: 'Back' }));
  await user.press(screen.getByRole('button', { name: 'Get Tickets' }));

  expect(labels()).toEqual(onFirstVisit);
});

test('the legend names the four seat colours, with the price of each seat type', async () => {
  await openSeatMap();

  expect(screen.getByText('Selected')).toBeOnTheScreen();
  expect(screen.getByText('Not available')).toBeOnTheScreen();
  expect(screen.getByText('VIP ($150)')).toBeOnTheScreen();
  expect(screen.getByText('Regular ($50)')).toBeOnTheScreen();
});

test('selected seats show as chips with a running total, and a chip\'s remove button takes its seat out', async () => {
  const user = await openSeatMap();
  const regular = screen.getAllByRole('button', { name: /, Regular, 50 dollars, available$/ })[0];
  const vip = screen.getAllByRole('button', { name: /, VIP, 150 dollars, available$/ })[0];
  const regularPlace = placeOf(regular);
  const vipPlace = placeOf(vip);
  expect(screen.getByText('$0')).toBeOnTheScreen();

  await user.press(regular);

  expect(screen.getByText(`${regularPlace.number} / ${regularPlace.row} row`)).toBeOnTheScreen();
  expect(screen.getByText('$50')).toBeOnTheScreen();

  await user.press(vip);

  expect(screen.getByText(`${vipPlace.number} / 10 row`)).toBeOnTheScreen();
  expect(screen.getByText('$200')).toBeOnTheScreen();

  await user.press(
    screen.getByRole('button', { name: `Remove seat ${regularPlace.number}, row ${regularPlace.row}` }),
  );

  expect(screen.queryByText(`${regularPlace.number} / ${regularPlace.row} row`)).not.toBeOnTheScreen();
  expect(screen.getByText(`${vipPlace.number} / 10 row`)).toBeOnTheScreen();
  expect(screen.getByText('$150')).toBeOnTheScreen();
  expect(regular).not.toBeSelected();
  expect(vip).toBeSelected();
});

test('a ninth seat is refused with a toast that goes away by itself, and the selection keeps its 8 seats', async () => {
  const user = await openSeatMap();
  const seats = availableSeats();
  for (const seat of seats.slice(0, 8)) {
    await user.press(seat);
  }
  expect(screen.getAllByRole('button', { selected: true })).toHaveLength(8);
  expect(screen.queryByText('You can pick up to 8 seats')).not.toBeOnTheScreen();

  await user.press(seats[8]);

  expect(screen.getByText('You can pick up to 8 seats')).toBeOnTheScreen();
  expect(seats[8]).not.toBeSelected();
  expect(screen.getAllByRole('button', { selected: true })).toHaveLength(8);

  await waitForElementToBeRemoved(() => screen.queryByText('You can pick up to 8 seats'), { timeout: 4000 });
});

test('with 8 seats selected, taking one out makes room for another', async () => {
  const user = await openSeatMap();
  const seats = availableSeats();
  for (const seat of seats.slice(0, 8)) {
    await user.press(seat);
  }

  await user.press(seats[0]);
  await user.press(seats[8]);

  expect(seats[8]).toBeSelected();
  expect(screen.queryByText('You can pick up to 8 seats')).not.toBeOnTheScreen();
});

test('Proceed to pay is disabled while the selection is empty, and again once its last seat is taken out', async () => {
  const user = await openSeatMap();
  expect(screen.getByRole('button', { name: 'Proceed to pay' })).toBeDisabled();
  expect(screen.getByText('No seats selected')).toBeOnTheScreen();

  await user.press(availableSeats()[0]);

  expect(screen.getByRole('button', { name: 'Proceed to pay' })).toBeEnabled();

  await user.press(availableSeats()[0]);

  expect(screen.getByRole('button', { name: 'Proceed to pay' })).toBeDisabled();
});

test('Proceed to pay with an empty selection shows no summary', async () => {
  const user = await openSeatMap();

  await user.press(screen.getByRole('button', { name: 'Proceed to pay' }));

  expect(screen.queryByText(/Payment isn't part of this demo/)).not.toBeOnTheScreen();
});

test('Proceed to pay shows a summary of the seats and the total, says payment is not part of the demo, and stays on the seat map', async () => {
  const user = await openSeatMap({ title: 'Dune: Part Three' });
  const regular = screen.getAllByRole('button', { name: /, Regular, 50 dollars, available$/ })[0];
  const vip = screen.getAllByRole('button', { name: /, VIP, 150 dollars, available$/ })[0];
  const regularPlace = placeOf(regular);
  const vipPlace = placeOf(vip);
  await user.press(regular);
  await user.press(vip);

  await user.press(screen.getByRole('button', { name: 'Proceed to pay' }));

  expect(screen.getByRole('header', { name: 'Your selection' })).toBeOnTheScreen();
  expect(screen.getByText(`Row ${regularPlace.row}, seat ${regularPlace.number}`)).toBeOnTheScreen();
  expect(screen.getByText('Regular $50')).toBeOnTheScreen();
  expect(screen.getByText(`Row 10, seat ${vipPlace.number}`)).toBeOnTheScreen();
  expect(screen.getByText('VIP $150')).toBeOnTheScreen();
  expect(screen.getByText('Total $200')).toBeOnTheScreen();
  expect(screen.getByText("Payment isn't part of this demo, so nothing is booked.")).toBeOnTheScreen();

  await user.press(screen.getByRole('button', { name: 'Close' }));

  expect(screen.queryByRole('header', { name: 'Your selection' })).not.toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
  expect(screen.getByText('December 22, 2099 | 12:30 Hall 1')).toBeOnTheScreen();
  // The selection is as it was
  expect(regular).toBeSelected();
  expect(vip).toBeSelected();
  expect(screen.getByText('$200')).toBeOnTheScreen();
});

test('leaving the seat map clears the selection', async () => {
  const user = await openSeatMap();
  await user.press(availableSeats()[0]);
  await user.press(availableSeats()[1]);
  expect(screen.getAllByRole('button', { selected: true })).toHaveLength(2);

  await user.press(screen.getByRole('button', { name: 'Back' }));
  await user.press(screen.getByRole('button', { name: 'Get Tickets' }));

  expect(screen.queryByRole('button', { selected: true })).not.toBeOnTheScreen();
  expect(screen.getByText('$0')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Proceed to pay' })).toBeDisabled();
});

test('the back button returns to Movie detail', async () => {
  const user = await openSeatMap();

  await user.press(screen.getByRole('button', { name: 'Back' }));

  expect(screen.getByRole('button', { name: 'Get Tickets' })).toBeOnTheScreen();
  expect(screen.queryByText('SCREEN')).not.toBeOnTheScreen();
});

test('in landscape, the seat map shows the same parts and a seat still toggles', async () => {
  await rotateToLandscape();
  const user = await openSeatMap({ title: 'Dune: Part Three' });

  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
  expect(screen.getByText('SCREEN')).toBeOnTheScreen();
  expect(screen.getByText('Regular ($50)')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Proceed to pay' })).toBeDisabled();

  const [seat] = availableSeats();
  const { row, number } = placeOf(seat);
  await user.press(seat);

  expect(seat).toBeSelected();
  expect(screen.getByText(`${number} / ${row} row`)).toBeOnTheScreen();
  expect(screen.getByText('$50')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Proceed to pay' })).toBeEnabled();
});

test('turning the phone keeps the selection', async () => {
  const user = await openSeatMap();
  const [seat] = availableSeats();
  const { row, number } = placeOf(seat);
  await user.press(seat);

  await rotateToLandscape();

  expect(screen.getByRole('button', { name: new RegExp(`^Row ${row}, seat ${number},`) })).toBeSelected();
  expect(screen.getByText(`${number} / ${row} row`)).toBeOnTheScreen();
  expect(screen.getByText('$50')).toBeOnTheScreen();
});
