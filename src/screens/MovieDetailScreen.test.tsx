import { screen, userEvent } from '@testing-library/react-native';

import { controlDate, passDays, passHours } from '../test/clock';
import { letDiskSettle } from '../test/disk';
import { goOffline, goOnline } from '../test/network';
import { renderApp } from '../test/renderApp';
import { gate, serveMovieDetail, serveUpcoming, tmdbMovie, tmdbMovieDetail, tmdbVideo } from '../test/tmdb';
import { rotateToLandscape } from '../test/window';

/** Opens the app on Movie list, which lists this movie, and taps it. */
async function openMovie({ id, title }: ReturnType<typeof tmdbMovieDetail>) {
  const user = userEvent.setup();
  serveUpcoming([[tmdbMovie({ id, title })]]);
  await renderApp();
  await user.press(await screen.findByRole('button', { name: title }));
  return user;
}

test('tapping a movie opens Movie detail with the title from the list before the rest arrives', async () => {
  const answer = gate();
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'Paul Atreides faces his destiny.' });
  serveMovieDetail(detail, { hold: answer.opened });

  await openMovie(detail);

  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
  expect(screen.queryByText('Paul Atreides faces his destiny.')).not.toBeOnTheScreen();

  answer.open();

  expect(await screen.findByText('Paul Atreides faces his destiny.')).toBeOnTheScreen();
});

test('Movie detail shows the genres and overview', async () => {
  const detail = tmdbMovieDetail({
    overview: 'A crew of thieves plans one last job.',
    genres: [
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
    ],
  });
  serveMovieDetail(detail);

  await openMovie(detail);

  expect(await screen.findByText('A crew of thieves plans one last job.')).toBeOnTheScreen();
  expect(screen.getByText('Comedy')).toBeOnTheScreen();
  expect(screen.getByText('Crime')).toBeOnTheScreen();
});

test('a movie that has not been released yet says In Theaters with its release date', async () => {
  // Far enough ahead to stay upcoming for as long as the tests are run
  const detail = tmdbMovieDetail({ release_date: '2099-12-22' });
  serveMovieDetail(detail);

  await openMovie(detail);

  expect(await screen.findByText('In Theaters December 22, 2099')).toBeOnTheScreen();
});

test('an old movie says Released with its release date', async () => {
  const detail = tmdbMovieDetail({ release_date: '2021-12-22' });
  serveMovieDetail(detail);

  await openMovie(detail);

  expect(await screen.findByText('Released December 22, 2021')).toBeOnTheScreen();
  expect(screen.queryByText(/In Theaters/)).not.toBeOnTheScreen();
});

test('a movie without a release date has no release line', async () => {
  const detail = tmdbMovieDetail({ overview: 'Coming at some point.', release_date: '' });
  serveMovieDetail(detail);

  await openMovie(detail);

  expect(await screen.findByText('Coming at some point.')).toBeOnTheScreen();
  expect(screen.queryByText(/In Theaters|Released/)).not.toBeOnTheScreen();
});

test('Movie detail shows a strip of the movie\'s images', async () => {
  const detail = tmdbMovieDetail({
    images: { backdrops: [{ file_path: '/first.jpg' }, { file_path: '/second.jpg' }] },
  });
  serveMovieDetail(detail);

  await openMovie(detail);

  expect(await screen.findByLabelText('Movie images')).toBeOnTheScreen();
});

test('a movie without images has no image strip on Movie detail', async () => {
  const detail = tmdbMovieDetail({ overview: 'No pictures yet.', images: { backdrops: [] } });
  serveMovieDetail(detail);

  await openMovie(detail);

  expect(await screen.findByText('No pictures yet.')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Movie images')).not.toBeOnTheScreen();
});

test('Movie detail offers Watch Trailer for a movie with a trailer', async () => {
  const detail = tmdbMovieDetail({ videos: { results: [tmdbVideo({ type: 'Trailer' })] } });
  serveMovieDetail(detail);

  await openMovie(detail);

  expect(await screen.findByRole('button', { name: 'Watch Trailer' })).toBeOnTheScreen();
});

test('Watch Trailer is hidden for a movie with no trailer', async () => {
  const detail = tmdbMovieDetail({
    overview: 'Only clips so far.',
    videos: { results: [tmdbVideo({ type: 'Clip' }), tmdbVideo({ type: 'Trailer', official: false })] },
  });
  serveMovieDetail(detail);

  await openMovie(detail);

  expect(await screen.findByText('Only clips so far.')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Watch Trailer' })).not.toBeOnTheScreen();
});

test('Movie detail shows placeholder sections while the details load', async () => {
  const answer = gate();
  const detail = tmdbMovieDetail({ overview: 'Loaded at last.' });
  serveMovieDetail(detail, { hold: answer.opened });

  await openMovie(detail);
  expect(screen.getByLabelText('Loading movie details')).toBeOnTheScreen();

  answer.open();

  expect(await screen.findByText('Loaded at last.')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading movie details')).not.toBeOnTheScreen();
});

test('when the details fail to load, Movie detail keeps the title and offers Retry, which recovers', async () => {
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'Loaded on the second try.' });
  serveMovieDetail(detail, { fail: 500 });
  const user = await openMovie(detail);

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
  const user = await openMovie(detail);
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();

  await user.press(screen.getByRole('button', { name: 'Back' }));

  expect(screen.queryByRole('header', { name: 'Dune: Part Three' })).not.toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Dune: Part Three' })).toBeOnTheScreen();
});

test('after the app restarts offline, Movie detail still shows a movie opened before, under an offline banner', async () => {
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'Paul Atreides faces his destiny.' });
  serveMovieDetail(detail);
  const user = await openMovie(detail);
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

test('Movie detail refreshes a movie that was last opened over a day ago', async () => {
  controlDate();
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'The old overview.' });
  serveMovieDetail(detail);
  const user = await openMovie(detail);
  await screen.findByText('The old overview.');
  await letDiskSettle();
  await screen.unmount();
  passHours(25);
  serveMovieDetail({ ...detail, overview: 'The new overview.' });

  await renderApp();
  await user.press(await screen.findByRole('button', { name: 'Dune: Part Three' }));

  expect(await screen.findByText('The new overview.')).toBeOnTheScreen();
});

test('Movie detail shows a movie opened within the day as it was, without a refresh', async () => {
  controlDate();
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'The old overview.' });
  serveMovieDetail(detail);
  const user = await openMovie(detail);
  await screen.findByText('The old overview.');
  await letDiskSettle();
  await screen.unmount();
  passHours(23);
  const refresh = serveMovieDetail({ ...detail, overview: 'The new overview.' });

  await renderApp();
  await user.press(await screen.findByRole('button', { name: 'Dune: Part Three' }));

  expect(await screen.findByText('The old overview.')).toBeOnTheScreen();
  // A refresh would reach the fake TMDb well within this time
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(refresh.requests).toBe(0);
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

  const user = await openMovie(detail);

  expect(await screen.findByText('Paul Atreides faces his destiny.')).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
  expect(screen.getByText('Science Fiction')).toBeOnTheScreen();
  expect(screen.getByText('Released December 22, 2021')).toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: 'Back' }));
  expect(screen.queryByRole('header', { name: 'Dune: Part Three' })).not.toBeOnTheScreen();
});

test('Movie detail drops a movie opened over a week ago without taking the fresher saved movies with it', async () => {
  controlDate();
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', overview: 'The old overview.' });
  serveMovieDetail(detail);
  const user = await openMovie(detail);
  await screen.findByText('The old overview.');
  await letDiskSettle();
  await screen.unmount();
  // Six days on, the list is refreshed and the detail is not
  passDays(6);
  serveUpcoming([[tmdbMovie({ id: detail.id, title: 'Dune: Part Three' }), tmdbMovie({ title: 'Another Movie' })]]);
  await renderApp();
  await screen.findByText('Another Movie');
  await letDiskSettle();
  await screen.unmount();
  passDays(2);
  await goOffline();

  await renderApp();
  await user.press(await screen.findByRole('button', { name: 'Dune: Part Three' }));

  expect(await screen.findByText("You're offline")).toBeOnTheScreen();
  expect(screen.queryByText('The old overview.')).not.toBeOnTheScreen();
});
