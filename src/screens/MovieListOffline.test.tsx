import { screen, userEvent } from '@testing-library/react-native';
import Constants from 'expo-constants';

import { returnToForeground } from '../test/appState';
import { controlDate, passDays, passHours } from '../test/clock';
import { letDiskSettle } from '../test/disk';
import { goOffline, goOnline, loseInternet, reconnectUnnoticed } from '../test/network';
import { isRefreshing, pullToRefresh } from '../test/pullToRefresh';
import { renderApp } from '../test/renderApp';
import { failUpcoming, serveUpcoming, tmdbMovie } from '../test/tmdb';

/** Opens the app online, waits for the list to be saved to disk, then closes the app. */
async function openOnlineThenClose(...titles: string[]) {
  serveUpcoming([titles.map((title) => tmdbMovie({ title }))]);
  const { unmount } = await renderApp();
  await screen.findByText(titles[0]);
  await letDiskSettle();
  await unmount();
}

test('reopening the app offline shows the saved movies and an offline banner', async () => {
  await openOnlineThenClose('Dune: Part Three', 'The Batman Part II');
  await goOffline();

  await renderApp();

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.getByText('The Batman Part II')).toBeOnTheScreen();
  expect(screen.getByText("You're offline. Showing saved movies.")).toBeOnTheScreen();
});

test('reopening the app online shows the saved movies without an offline banner', async () => {
  await openOnlineThenClose('Dune: Part Three');

  await renderApp();

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.queryByText(/You're offline/)).not.toBeOnTheScreen();
});

test('offline with nothing saved, Movie list shows an offline state with Retry', async () => {
  await goOffline();

  await renderApp();

  expect(await screen.findByText("You're offline")).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading upcoming movies')).not.toBeOnTheScreen();
});

test('when the connection comes back, the offline state gives way to the movies', async () => {
  await goOffline();
  await renderApp();
  await screen.findByText("You're offline");

  serveUpcoming([[tmdbMovie({ title: 'Dune: Part Three' })]]);
  await goOnline();

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.queryByText("You're offline")).not.toBeOnTheScreen();
});

test('when the connection comes back after an hour, Movie list refreshes its saved movies', async () => {
  controlDate();
  await openOnlineThenClose('Dune: Part Three');
  await goOffline();
  await renderApp();
  await screen.findByText("You're offline. Showing saved movies.");

  passHours(2);
  serveUpcoming([[tmdbMovie({ title: 'The Batman Part II' })]]);
  await goOnline();

  expect(await screen.findByText('The Batman Part II')).toBeOnTheScreen();
  expect(screen.queryByText('Dune: Part Three')).not.toBeOnTheScreen();
  expect(screen.queryByText(/You're offline/)).not.toBeOnTheScreen();
});

test('when the connection comes back within the hour, Movie list keeps its saved movies', async () => {
  await openOnlineThenClose('Dune: Part Three');
  await goOffline();
  await renderApp();
  await screen.findByText("You're offline. Showing saved movies.");

  serveUpcoming([[tmdbMovie({ title: 'The Batman Part II' })]]);
  await goOnline();

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.queryByText('The Batman Part II')).not.toBeOnTheScreen();
});

test('returning to the app after an hour refreshes Movie list', async () => {
  controlDate();
  serveUpcoming([[tmdbMovie({ title: 'Dune: Part Three' })]]);
  await renderApp();
  await screen.findByText('Dune: Part Three');

  passHours(2);
  serveUpcoming([[tmdbMovie({ title: 'The Batman Part II' })]]);
  await returnToForeground();

  expect(await screen.findByText('The Batman Part II')).toBeOnTheScreen();
  expect(screen.queryByText('Dune: Part Three')).not.toBeOnTheScreen();
});

test('returning to the app within the hour leaves Movie list as it is', async () => {
  serveUpcoming([[tmdbMovie({ title: 'Dune: Part Three' })]]);
  await renderApp();
  await screen.findByText('Dune: Part Three');

  serveUpcoming([[tmdbMovie({ title: 'The Batman Part II' })]]);
  await returnToForeground();

  expect(screen.getByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.queryByText('The Batman Part II')).not.toBeOnTheScreen();
});

test('a saved copy older than a week is not shown after reopening the app', async () => {
  controlDate();
  await openOnlineThenClose('Dune: Part Three');
  passDays(8);
  await goOffline();

  await renderApp();

  expect(await screen.findByText("You're offline")).toBeOnTheScreen();
  expect(screen.queryByText('Dune: Part Three')).not.toBeOnTheScreen();
});

test('a saved copy keeps its age when the app is reopened, so it is dropped a week after it was fetched', async () => {
  controlDate();
  await openOnlineThenClose('Dune: Part Three');
  passDays(5);
  // TMDb fails, so the reopened app cannot renew the copy, and it saves again all the same
  failUpcoming(500);
  const reopened = await renderApp();
  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  await letDiskSettle();
  await reopened.unmount();
  passDays(3);
  await goOffline();

  await renderApp();

  expect(await screen.findByText("You're offline")).toBeOnTheScreen();
  expect(screen.queryByText('Dune: Part Three')).not.toBeOnTheScreen();
});

test('a refresh that fails does not wipe the saved movies', async () => {
  controlDate();
  await openOnlineThenClose('Dune: Part Three');
  passHours(2);
  failUpcoming(500);
  const reopened = await renderApp();
  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  await letDiskSettle();
  await reopened.unmount();
  await goOffline();

  await renderApp();

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
});

test('movies saved by an earlier version of the app are not shown after an update', async () => {
  await openOnlineThenClose('Dune: Part Three');
  jest.replaceProperty(Constants, 'expoConfig', { ...Constants.expoConfig!, version: '9.9.9' });
  await goOffline();

  await renderApp();

  expect(await screen.findByText("You're offline")).toBeOnTheScreen();
  expect(screen.queryByText('Dune: Part Three')).not.toBeOnTheScreen();
});

test('on Wi-Fi without internet, Movie list shows the offline state', async () => {
  await loseInternet();

  await renderApp();

  expect(await screen.findByText("You're offline")).toBeOnTheScreen();
});

test('on Wi-Fi without internet, saved movies show under the offline banner', async () => {
  await openOnlineThenClose('Dune: Part Three');
  await loseInternet();

  await renderApp();

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.getByText("You're offline. Showing saved movies.")).toBeOnTheScreen();
});

test('Retry in the offline state finds a connection that came back unnoticed', async () => {
  const user = userEvent.setup();
  await goOffline();
  await renderApp();
  await screen.findByText("You're offline");

  serveUpcoming([[tmdbMovie({ title: 'Dune: Part Three' })]]);
  reconnectUnnoticed();
  await user.press(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
});

test('pulling saved movies down while offline shows no endless spinner', async () => {
  await openOnlineThenClose('Dune: Part Three');
  await goOffline();
  await renderApp();
  const movies = await screen.findByLabelText('Upcoming movies');

  await pullToRefresh(movies);

  expect(isRefreshing(movies)).toBe(false);
  expect(screen.getByText('Dune: Part Three')).toBeOnTheScreen();
});

test('only the first three pages of movies are saved for reopening the app', async () => {
  // A FlashList row is 100 high and the window 900 high (src/test/setup.ts), a page has 20 rows
  const pageHeight = 20 * 100;
  const pageEnd = (page: number) => page * pageHeight - 900;
  const page = (number: number) =>
    Array.from({ length: 20 }, (_, index) => tmdbMovie({ title: `Page ${number} movie ${index + 1}` }));
  serveUpcoming([page(1), page(2), page(3), [tmdbMovie({ title: 'Page 4 movie' })]]);
  const user = userEvent.setup();
  await renderApp();
  const movies = await screen.findByLabelText('Upcoming movies');
  // Scroll to a page's end to load the next page, then on to the next page's first movie
  await user.scrollTo(movies, { y: pageEnd(1) + 200 });
  await user.scrollTo(movies, { y: pageHeight });
  await screen.findByText('Page 2 movie 1');
  await user.scrollTo(movies, { y: pageEnd(2) + 200 });
  await user.scrollTo(movies, { y: 2 * pageHeight });
  await screen.findByText('Page 3 movie 1');
  await user.scrollTo(movies, { y: pageEnd(3) + 200 });
  await user.scrollTo(movies, { y: 3 * pageHeight });
  await screen.findByText('Page 4 movie');
  await letDiskSettle();
  await goOffline();
  await screen.unmount();

  await renderApp();

  const restored = await screen.findByLabelText('Upcoming movies');
  await user.scrollTo(restored, { y: 2 * pageHeight });
  expect(await screen.findByText('Page 3 movie 1')).toBeOnTheScreen();
  await user.scrollTo(restored, { y: 3 * pageHeight });
  expect(screen.queryByText('Page 4 movie')).not.toBeOnTheScreen();
});
