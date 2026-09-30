import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { pullToRefresh } from '../test/pullToRefresh';
import { renderApp } from '../test/renderApp';
import { failUpcoming, fullPage, gate, serveUpcoming, stallUpcoming, tmdbMovie } from '../test/tmdb';
import { rotateToLandscape } from '../test/window';

test('Movie List opens under the Watch header and shows the upcoming movies TMDb serves', async () => {
  serveUpcoming([[tmdbMovie({ title: 'Dune: Part Three' }), tmdbMovie({ title: 'The Batman Part II' })]]);

  await renderApp();

  expect(screen.getByRole('header', { name: 'Watch' })).toBeOnTheScreen();
  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.getByText('The Batman Part II')).toBeOnTheScreen();
});

test('Movie List shows placeholder cards while the movies load, then the movies replace them', async () => {
  const answer = gate();
  serveUpcoming([[tmdbMovie({ title: 'Dune: Part Three' })]], { hold: { 1: answer.opened } });
  await renderApp();
  expect(screen.getByLabelText('Loading upcoming movies')).toBeOnTheScreen();

  answer.open();

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading upcoming movies')).not.toBeOnTheScreen();
});

test('Movie List says so when TMDb has no upcoming movies', async () => {
  serveUpcoming([[]]);

  await renderApp();

  expect(await screen.findByText('No upcoming movies right now')).toBeOnTheScreen();
});

test('scrolling to the end of Movie List loads the next page of upcoming movies', async () => {
  serveUpcoming([fullPage(), [tmdbMovie({ title: 'Closing Night' })]]);
  const user = userEvent.setup();
  await renderApp();
  const movies = await screen.findByLabelText('Upcoming movies');
  expect(screen.queryByText('Closing Night')).not.toBeOnTheScreen();

  await user.scrollTo(movies, { y: 1100 });

  expect(await screen.findByText('Closing Night')).toBeOnTheScreen();
});

test('while the next page loads, Movie List shows a placeholder card below the movies', async () => {
  const nextPage = gate();
  serveUpcoming([fullPage(), [tmdbMovie({ title: 'Closing Night' })]], { hold: { 2: nextPage.opened } });
  const user = userEvent.setup();
  await renderApp();

  await user.scrollTo(await screen.findByLabelText('Upcoming movies'), { y: 1100 });
  expect(await screen.findByLabelText('Loading more movies')).toBeOnTheScreen();
  nextPage.open();

  expect(await screen.findByText('Closing Night')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading more movies')).not.toBeOnTheScreen();
});

test('when the next page fails, Movie List keeps its movies and offers Retry below them, which loads the page', async () => {
  const firstPage = fullPage();
  serveUpcoming([firstPage, [tmdbMovie({ title: 'Closing Night' })]], { failPages: { 2: 500 } });
  const user = userEvent.setup();
  await renderApp();

  await user.scrollTo(await screen.findByLabelText('Upcoming movies'), { y: 1100 });
  expect(await screen.findByText("Couldn't load more movies")).toBeOnTheScreen();
  expect(screen.getByText('Opening 20')).toBeOnTheScreen();

  const retried = gate();
  serveUpcoming([firstPage, [tmdbMovie({ title: 'Closing Night' })]], { hold: { 2: retried.opened } });
  await user.press(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByLabelText('Loading more movies')).toBeOnTheScreen();
  expect(screen.queryByText("Couldn't load more movies")).not.toBeOnTheScreen();

  retried.open();

  expect(await screen.findByText('Closing Night')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading more movies')).not.toBeOnTheScreen();
});

test('Movie List keeps its movies when the phone rotates to landscape', async () => {
  serveUpcoming([[tmdbMovie({ title: 'Dune: Part Three' }), tmdbMovie({ title: 'The Batman Part II' })]]);
  await renderApp();
  await screen.findByText('Dune: Part Three');

  await rotateToLandscape();

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.getByText('The Batman Part II')).toBeOnTheScreen();
});

test('a movie that TMDb lists on two pages shows once on Movie List', async () => {
  // TMDb's pages overlap: the end of one page comes back at the start of the next
  const repeated = tmdbMovie({ title: 'Repeat Showing' });
  serveUpcoming([fullPage(repeated), [repeated, tmdbMovie({ title: 'Closing Night' })]]);
  const user = userEvent.setup();
  await renderApp();

  await user.scrollTo(await screen.findByLabelText('Upcoming movies'), { y: 1100 });

  expect(await screen.findByText('Closing Night')).toBeOnTheScreen();
  expect(screen.getByText('Repeat Showing')).toBeOnTheScreen();
});

test('pulling Movie List down refreshes it with the latest upcoming movies', async () => {
  serveUpcoming([[tmdbMovie({ title: 'Dune: Part Three' })]]);
  await renderApp();
  const movies = await screen.findByLabelText('Upcoming movies');
  expect(screen.getByText('Dune: Part Three')).toBeOnTheScreen();

  serveUpcoming([[tmdbMovie({ title: 'The Batman Part II' })]]);
  await pullToRefresh(movies);

  expect(await screen.findByText('The Batman Part II')).toBeOnTheScreen();
  expect(screen.queryByText('Dune: Part Three')).not.toBeOnTheScreen();
});

test('a failed load shows Movie List a message with Retry, and Retry brings the movies', async () => {
  failUpcoming(500);
  const user = userEvent.setup();
  await renderApp();
  expect(await screen.findByText("Couldn't load movies")).toBeOnTheScreen();

  serveUpcoming([[tmdbMovie({ title: 'Dune: Part Three' })]]);
  await user.press(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByText('Dune: Part Three')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeOnTheScreen();
});

test.each([
  {
    situation: 'TMDb rejects the access token',
    fail: () => failUpcoming(401),
    message: 'The TMDb access token is missing or invalid. Check EXPO_PUBLIC_TMDB_TOKEN in your .env file.',
  },
  {
    situation: 'TMDb does not find the list',
    fail: () => failUpcoming(404),
    message: "TMDb couldn't find what the app asked for.",
  },
  {
    situation: 'TMDb rate limits the app',
    fail: () => failUpcoming(429),
    message: 'TMDb is getting too many requests. Wait a moment, then try again.',
  },
  {
    situation: 'the connection drops',
    fail: () => failUpcoming('network'),
    message: "Can't reach TMDb. Check your connection and try again.",
  },
  {
    situation: 'TMDb has a server error',
    fail: () => failUpcoming(500),
    message: 'TMDb had a problem. Try again in a moment.',
  },
])('when $situation, Movie List says what went wrong', async ({ fail, message }) => {
  fail();

  await renderApp();

  expect(await screen.findByText(message)).toBeOnTheScreen();
});

test('without an access token, Movie List says the token is missing', async () => {
  delete process.env.EXPO_PUBLIC_TMDB_TOKEN;

  await renderApp();

  expect(await screen.findByText(/access token is missing or invalid/)).toBeOnTheScreen();
});

test('leaving Movie List cancels the request for movies that has not answered yet', async () => {
  const request = stallUpcoming();
  const { unmount } = await renderApp();
  await waitFor(() => expect(request.received).toBe(true));

  await unmount();

  await waitFor(() => expect(request.cancelled).toBe(true));
});
