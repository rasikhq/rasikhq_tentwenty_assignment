import { screen, userEvent } from '@testing-library/react-native';

import { controlDate, passHours } from '../test/clock';
import { letDiskSettle } from '../test/disk';
import { goOffline, goOnline } from '../test/network';
import { renderApp } from '../test/renderApp';
import { gate, serveMovieDetail, serveUpcoming, tmdbMovie, tmdbMovieDetail } from '../test/tmdb';
import { rotateToLandscape } from '../test/window';

/** Opens the app on Movie list, with these movies, and taps the first one. */
async function openFirstMovie(...details: ReturnType<typeof tmdbMovieDetail>[]) {
  const user = userEvent.setup();
  serveUpcoming([details.map(({ id, title }) => tmdbMovie({ id, title }))]);
  await renderApp();
  await user.press(await screen.findByRole('button', { name: details[0].title }));
  return user;
}

test('tapping a movie opens its detail with the title from the list before the rest arrives', async () => {
  const answer = gate();
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'Paul Atreides faces his destiny.' });
  serveMovieDetail(detail, { hold: answer.opened });

  await openFirstMovie(detail);

  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
  expect(screen.queryByText('Paul Atreides faces his destiny.')).not.toBeOnTheScreen();

  answer.open();

  expect(await screen.findByText('Paul Atreides faces his destiny.')).toBeOnTheScreen();
});

test('the detail shows the movie\'s genres and overview', async () => {
  const detail = tmdbMovieDetail({
    overview: 'A crew of thieves plans one last job.',
    genres: [
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
    ],
  });
  serveMovieDetail(detail);

  await openFirstMovie(detail);

  expect(await screen.findByText('A crew of thieves plans one last job.')).toBeOnTheScreen();
  expect(screen.getByText('Comedy')).toBeOnTheScreen();
  expect(screen.getByText('Crime')).toBeOnTheScreen();
});

test('a movie that has not been released yet says In Theaters with its release date', async () => {
  // Far enough ahead to stay upcoming for as long as the tests are run
  const detail = tmdbMovieDetail({ release_date: '2099-12-22' });
  serveMovieDetail(detail);

  await openFirstMovie(detail);

  expect(await screen.findByText('In Theaters December 22, 2099')).toBeOnTheScreen();
});

test('an old movie says Released with its release date', async () => {
  const detail = tmdbMovieDetail({ release_date: '2021-12-22' });
  serveMovieDetail(detail);

  await openFirstMovie(detail);

  expect(await screen.findByText('Released December 22, 2021')).toBeOnTheScreen();
  expect(screen.queryByText(/In Theaters/)).not.toBeOnTheScreen();
});

test('a movie without a release date has no release line', async () => {
  const detail = tmdbMovieDetail({ overview: 'Coming at some point.', release_date: '' });
  serveMovieDetail(detail);

  await openFirstMovie(detail);

  expect(await screen.findByText('Coming at some point.')).toBeOnTheScreen();
  expect(screen.queryByText(/In Theaters|Released/)).not.toBeOnTheScreen();
});

test('a strip of the movie\'s images sits under the overview', async () => {
  const detail = tmdbMovieDetail({
    images: { backdrops: [{ file_path: '/first.jpg' }, { file_path: '/second.jpg' }] },
  });
  serveMovieDetail(detail);

  await openFirstMovie(detail);

  expect(await screen.findByLabelText('Movie images')).toBeOnTheScreen();
});

test('a movie without images has no image strip', async () => {
  const detail = tmdbMovieDetail({ overview: 'No pictures yet.', images: { backdrops: [] } });
  serveMovieDetail(detail);

  await openFirstMovie(detail);

  expect(await screen.findByText('No pictures yet.')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Movie images')).not.toBeOnTheScreen();
});

test('placeholder sections stand in for the details while they load', async () => {
  const answer = gate();
  const detail = tmdbMovieDetail({ overview: 'Loaded at last.' });
  serveMovieDetail(detail, { hold: answer.opened });

  await openFirstMovie(detail);
  expect(screen.getByLabelText('Loading movie details')).toBeOnTheScreen();

  answer.open();

  expect(await screen.findByText('Loaded at last.')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading movie details')).not.toBeOnTheScreen();
});

test('when the detail fails to load, Movie detail keeps the title and offers Retry, which recovers', async () => {
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'Loaded on the second try.' });
  serveMovieDetail(detail, { fail: 500 });
  const user = await openFirstMovie(detail);

  expect(await screen.findByText("Couldn't load this movie")).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading movie details')).not.toBeOnTheScreen();

  serveMovieDetail(detail);
  await user.press(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByText('Loaded on the second try.')).toBeOnTheScreen();
  expect(screen.queryByText("Couldn't load this movie")).not.toBeOnTheScreen();
});

test('the back button returns to Movie list', async () => {
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three' });
  serveMovieDetail(detail);
  const user = await openFirstMovie(detail);
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();

  await user.press(screen.getByRole('button', { name: 'Back' }));

  expect(screen.queryByRole('header', { name: 'Dune: Part Three' })).not.toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Dune: Part Three' })).toBeOnTheScreen();
});

test('after the app restarts offline, a detail opened before still shows, under an offline banner', async () => {
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'Paul Atreides faces his destiny.' });
  serveMovieDetail(detail);
  const user = await openFirstMovie(detail);
  await screen.findByText('Paul Atreides faces his destiny.');
  await letDiskSettle();
  await goOffline();
  await screen.unmount();

  await renderApp();
  await user.press(await screen.findByRole('button', { name: 'Dune: Part Three' }));

  expect(await screen.findByText('Paul Atreides faces his destiny.')).toBeOnTheScreen();
  expect(screen.getByText("You're offline. Showing saved details.")).toBeOnTheScreen();
});

test('offline with no saved detail, Movie detail offers an offline state with Retry until the connection returns', async () => {
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'Paul Atreides faces his destiny.' });
  serveMovieDetail(detail);
  serveUpcoming([[tmdbMovie({ id: detail.id, title: detail.title })]]);
  const user = userEvent.setup();
  await renderApp();
  const card = await screen.findByRole('button', { name: 'Dune: Part Three' });
  await goOffline();

  await user.press(card);

  expect(await screen.findByText("You're offline")).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();

  await goOnline();

  expect(await screen.findByText('Paul Atreides faces his destiny.')).toBeOnTheScreen();
  expect(screen.queryByText("You're offline")).not.toBeOnTheScreen();
});

test('a detail opened a day ago refreshes when it is opened again', async () => {
  controlDate();
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'The old overview.' });
  serveMovieDetail(detail);
  const user = await openFirstMovie(detail);
  await screen.findByText('The old overview.');
  await letDiskSettle();
  await screen.unmount();
  passHours(25);
  serveMovieDetail({ ...detail, overview: 'The new overview.' });

  await renderApp();
  await user.press(await screen.findByRole('button', { name: 'Dune: Part Three' }));

  expect(await screen.findByText('The new overview.')).toBeOnTheScreen();
});

test('a detail opened within the day is shown as it was, without a refresh', async () => {
  controlDate();
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'The old overview.' });
  serveMovieDetail(detail);
  const user = await openFirstMovie(detail);
  await screen.findByText('The old overview.');
  await letDiskSettle();
  await screen.unmount();
  passHours(23);
  serveMovieDetail({ ...detail, overview: 'The new overview.' });

  await renderApp();
  await user.press(await screen.findByRole('button', { name: 'Dune: Part Three' }));

  expect(await screen.findByText('The old overview.')).toBeOnTheScreen();
  expect(screen.queryByText('The new overview.')).not.toBeOnTheScreen();
});

test('in landscape, Movie detail still shows its title, details and back button', async () => {
  const detail = tmdbMovieDetail({
    title: 'Dune: Part Three',
    overview: 'Paul Atreides faces his destiny.',
    genres: [{ id: 878, name: 'Science Fiction' }],
    release_date: '2021-12-22',
  });
  serveMovieDetail(detail);
  await rotateToLandscape();

  const user = await openFirstMovie(detail);

  expect(await screen.findByText('Paul Atreides faces his destiny.')).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
  expect(screen.getByText('Science Fiction')).toBeOnTheScreen();
  expect(screen.getByText('Released December 22, 2021')).toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: 'Back' }));
  expect(screen.queryByRole('header', { name: 'Dune: Part Three' })).not.toBeOnTheScreen();
});
