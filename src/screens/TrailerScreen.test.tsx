import { screen, userEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { goOffline } from '../test/network';
import { renderApp } from '../test/renderApp';
import { serveMovieDetail, serveUpcoming, tmdbMovie, tmdbMovieDetail, tmdbVideo } from '../test/tmdb';
import { endTrailer, failTrailer } from '../test/trailerPlayer';

/** Opens the app on Movie list and opens this movie's detail, as far as its Watch Trailer button. */
async function openMovie(detail: ReturnType<typeof tmdbMovieDetail>) {
  const user = userEvent.setup();
  serveUpcoming([[tmdbMovie({ id: detail.id, title: detail.title })]]);
  serveMovieDetail(detail);
  await renderApp();
  await user.press(await screen.findByRole('button', { name: detail.title }));
  await screen.findByRole('button', { name: 'Watch Trailer' });
  return user;
}

/** Opens this movie's detail and taps Watch Trailer. */
async function watchTrailer(detail: ReturnType<typeof tmdbMovieDetail>) {
  const user = await openMovie(detail);
  await user.press(screen.getByRole('button', { name: 'Watch Trailer' }));
  return user;
}

test('Watch Trailer on Movie detail opens the movie\'s trailer, already playing', async () => {
  const detail = tmdbMovieDetail({
    videos: { results: [tmdbVideo({ type: 'Clip', key: 'a-clip' }), tmdbVideo({ type: 'Trailer', key: 'the-trailer' })] },
  });

  await watchTrailer(detail);

  expect(screen.getByLabelText('Trailer player')).toBeOnTheScreen();
  expect(screen.getByText('the-trailer')).toBeOnTheScreen();
});

test('when the trailer ends, the app returns to Movie detail with no user action', async () => {
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', videos: { results: [tmdbVideo()] } });
  await watchTrailer(detail);

  await endTrailer();

  expect(screen.queryByLabelText('Trailer player')).not.toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
});

test('the close button leaves the trailer for Movie detail at any time', async () => {
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', videos: { results: [tmdbVideo()] } });
  const user = await watchTrailer(detail);

  await user.press(screen.getByRole('button', { name: 'Close trailer' }));

  expect(screen.queryByLabelText('Trailer player')).not.toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
});

test("when the trailer can't play in the app, the trailer screen says so and offers Retry, Open in YouTube and Back", async () => {
  const detail = tmdbMovieDetail({ videos: { results: [tmdbVideo()] } });
  await watchTrailer(detail);

  await failTrailer();

  expect(screen.getByText("This trailer can't play here")).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Open in YouTube' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
  expect(screen.queryByLabelText('Trailer player')).not.toBeOnTheScreen();
});

test('Retry plays the trailer again, and the app still returns to Movie detail when it ends', async () => {
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', videos: { results: [tmdbVideo({ key: 'the-trailer' })] } });
  const user = await watchTrailer(detail);
  await failTrailer();

  await user.press(screen.getByRole('button', { name: 'Retry' }));

  expect(screen.getByText('the-trailer')).toBeOnTheScreen();
  expect(screen.queryByText("This trailer can't play here")).not.toBeOnTheScreen();

  await endTrailer();

  expect(screen.queryByLabelText('Trailer player')).not.toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
});

test('Open in YouTube opens the trailer in YouTube', async () => {
  const detail = tmdbMovieDetail({ videos: { results: [tmdbVideo({ key: 'the-trailer' })] } });
  // Leaving for another app is only visible where the app hands the link to the phone
  const openURL = jest.spyOn(Linking, 'openURL');
  const user = await watchTrailer(detail);
  await failTrailer();

  await user.press(screen.getByRole('button', { name: 'Open in YouTube' }));

  expect(openURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=the-trailer');
});

test("Back on a trailer that can't play returns to Movie detail", async () => {
  const detail = tmdbMovieDetail({ title: 'Dune: Part Three', videos: { results: [tmdbVideo()] } });
  const user = await watchTrailer(detail);
  await failTrailer();

  await user.press(screen.getByRole('button', { name: 'Back' }));

  expect(screen.queryByText("This trailer can't play here")).not.toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Dune: Part Three' })).toBeOnTheScreen();
});

test("offline, a trailer that can't play says the phone is offline", async () => {
  const detail = tmdbMovieDetail({ videos: { results: [tmdbVideo()] } });
  await watchTrailer(detail);
  await goOffline();

  await failTrailer();

  expect(screen.getByText("You're offline")).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Open in YouTube' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
});

test('offline, Watch Trailer says the phone is offline at once, without waiting for the player to fail', async () => {
  const detail = tmdbMovieDetail({ videos: { results: [tmdbVideo()] } });
  const user = await openMovie(detail);
  await goOffline();

  await user.press(screen.getByRole('button', { name: 'Watch Trailer' }));

  expect(screen.getByText("You're offline")).toBeOnTheScreen();
  expect(screen.queryByLabelText('Trailer player')).not.toBeOnTheScreen();
});
