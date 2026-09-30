import { screen, userEvent } from '@testing-library/react-native';

import { returnToForeground } from '../test/appState';
import { controlDate, passHours } from '../test/clock';
import { letDiskSettle, waitForSavedMovie } from '../test/disk';
import { goOffline, goOnline } from '../test/network';
import { renderApp } from '../test/renderApp';
import { serveUpcoming, tmdbMovie } from '../test/tmdb';

/** Opens the app online, waits for the list to be saved to disk, then closes the app. */
async function openOnlineThenClose(...titles: string[]) {
  serveUpcoming([titles.map((title) => tmdbMovie({ title }))]);
  const { unmount } = await renderApp();
  await screen.findByText(titles[0]);
  await waitForSavedMovie(titles[0]);
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

test('offline with nothing saved, Movie List shows an offline state with Retry', async () => {
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

test('when the connection comes back after an hour, Movie List refreshes its saved movies', async () => {
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

test('when the connection comes back within the hour, Movie List keeps its saved movies', async () => {
  await openOnlineThenClose('Dune: Part Three');
  await goOffline();
  await renderApp();
  await screen.findByText("You're offline. Showing saved movies.");

  serveUpcoming([[tmdbMovie({ title: 'The Batman Part II' })]]);
  await goOnline();

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.queryByText('The Batman Part II')).not.toBeOnTheScreen();
});

test('returning to the app after an hour refreshes Movie List', async () => {
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

test('returning to the app within the hour leaves Movie List as it is', async () => {
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
  passHours(8 * 24);
  await goOffline();

  await renderApp();

  expect(await screen.findByText("You're offline")).toBeOnTheScreen();
  expect(screen.queryByText('Dune: Part Three')).not.toBeOnTheScreen();
});

test('only the first three pages of movies are saved for reopening the app', async () => {
  const page = (number: number) =>
    Array.from({ length: 20 }, (_, index) => tmdbMovie({ title: `Page ${number} movie ${index + 1}` }));
  serveUpcoming([page(1), page(2), page(3), [tmdbMovie({ title: 'Page 4 movie' })]]);
  const user = userEvent.setup();
  await renderApp();
  const movies = await screen.findByLabelText('Upcoming movies');
  // Each page fills 2000 more of the list: scroll to its end to load the next page, then on to its first movie
  await user.scrollTo(movies, { y: 1100 });
  await user.scrollTo(movies, { y: 2000 });
  await screen.findByText('Page 2 movie 1');
  await user.scrollTo(movies, { y: 3100 });
  await user.scrollTo(movies, { y: 4000 });
  await screen.findByText('Page 3 movie 1');
  await user.scrollTo(movies, { y: 5100 });
  await user.scrollTo(movies, { y: 6000 });
  await screen.findByText('Page 4 movie');
  await waitForSavedMovie('Page 3 movie 1');
  await letDiskSettle();
  await goOffline();
  await screen.unmount();

  await renderApp();

  const restored = await screen.findByLabelText('Upcoming movies');
  await user.scrollTo(restored, { y: 4000 });
  expect(await screen.findByText('Page 3 movie 1')).toBeOnTheScreen();
  await user.scrollTo(restored, { y: 5100 });
  expect(screen.queryByText('Page 4 movie')).not.toBeOnTheScreen();
  expect(screen.queryByText('Page 4 movie')).not.toBeOnTheScreen();
});
