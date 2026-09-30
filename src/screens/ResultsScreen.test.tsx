import { screen, userEvent } from '@testing-library/react-native';

import { letDiskSettle } from '../test/disk';
import { goOffline, goOnline } from '../test/network';
import { renderApp } from '../test/renderApp';
import { letSearchSettle } from '../test/search';
import { fullPage, gate, serveGenres, serveMovieDetail, serveSearch, tmdbMovie, tmdbMovieDetail } from '../test/tmdb';
import { rotateToLandscape } from '../test/window';

// Search asks TMDb for the genre list as it opens, and Results reads it too
beforeEach(() => {
  serveGenres();
});

/** Opens the app on Search, types into its field and presses the keyboard's search key. */
async function submitSearch(text: string) {
  const user = userEvent.setup();
  await renderApp({ name: 'Search' });
  await user.type(screen.getByPlaceholderText('Search movies'), text, { submitEditing: true });
  return user;
}

/** Opens the app on Search, types into its field and waits for Top Results. */
async function openTopResults(text: string) {
  const user = userEvent.setup();
  await renderApp({ name: 'Search' });
  await user.type(screen.getByPlaceholderText('Search movies'), text);
  await screen.findByText('Top Results');
  return user;
}

/** Presses the keyboard's search key, with the text the field already has. */
function pressSearchKey(user: ReturnType<typeof userEvent.setup>) {
  return user.type(screen.getByPlaceholderText('Search movies'), '', { submitEditing: true });
}

test('submitting a search opens Results, with how many movies TMDb matched and the first page of them', async () => {
  serveSearch({ dune: [fullPage(), [tmdbMovie({ title: 'Dune: Part Two' })]] });

  await submitSearch('Dune');

  expect(await screen.findByRole('header', { name: '21 Results Found' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Opening 1' })).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Dune: Part Two' })).not.toBeOnTheScreen();
});

test('scrolling to the end of Results loads the next page of matches', async () => {
  serveSearch({ dune: [fullPage(), [tmdbMovie({ title: 'Dune: Part Two' })]] });
  const user = await submitSearch('Dune');
  const results = await screen.findByLabelText('Results');

  await user.scrollTo(results, { y: 1100 });

  expect(await screen.findByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: '21 Results Found' })).toBeOnTheScreen();
});

test('back from Results returns to Search with the text still in the field', async () => {
  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two' })] });
  const user = await submitSearch('Dune');
  await screen.findByRole('header', { name: '1 Result Found' });

  await user.press(screen.getByRole('button', { name: 'Back' }));

  expect(screen.queryByRole('header', { name: '1 Result Found' })).not.toBeOnTheScreen();
  expect(screen.getByPlaceholderText('Search movies')).toHaveDisplayValue('Dune');
  expect(screen.getByText('Top Results')).toBeOnTheScreen();
});

test("a Results row shows the name of the movie's first genre, as a Top Results row does", async () => {
  serveGenres([
    { id: 12, name: 'Adventure' },
    { id: 878, name: 'Science Fiction' },
  ]);
  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two', genre_ids: [878, 12] })] });

  await submitSearch('Dune');

  expect(await screen.findByRole('button', { name: 'Dune: Part Two, Science Fiction' })).toBeOnTheScreen();
  expect(screen.getByText('Science Fiction')).toBeOnTheScreen();
  expect(screen.queryByText('Adventure')).not.toBeOnTheScreen();
});

test('tapping a Results row opens Movie detail with the title from the row before the rest arrives', async () => {
  const answer = gate();
  const detail = tmdbMovieDetail({ title: 'Dune: Part Two', overview: 'Paul Atreides unites with the Fremen.' });
  serveMovieDetail(detail, { hold: answer.opened });
  serveSearch({ dune: [tmdbMovie({ id: detail.id, title: 'Dune: Part Two' })] });
  const user = await submitSearch('Dune');

  await user.press(await screen.findByRole('button', { name: 'Dune: Part Two' }));

  expect(screen.getByRole('header', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.queryByText('Paul Atreides unites with the Fremen.')).not.toBeOnTheScreen();

  answer.open();

  expect(await screen.findByText('Paul Atreides unites with the Fremen.')).toBeOnTheScreen();
});

test('Results opens with the page Top Results already shows, without asking TMDb for it again', async () => {
  const search = serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two' })] });
  const user = await openTopResults('Dune');

  await pressSearchKey(user);

  expect(screen.getByRole('header', { name: '1 Result Found' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  await letSearchSettle();
  expect(search.queries).toEqual(['dune']);
});

test("with only spaces in the search field, the keyboard's search key opens nothing", async () => {
  await submitSearch('   ');

  expect(screen.queryByRole('button', { name: 'Back' })).not.toBeOnTheScreen();
  expect(screen.getByText('Search for a movie by its title.')).toBeOnTheScreen();
});

test('Results shows placeholder rows while TMDb answers, then the count and the movies replace them', async () => {
  const answer = gate();
  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two' })] }, { hold: { dune: answer.opened } });

  await submitSearch('Dune');

  expect(screen.getByRole('header', { name: 'Results' })).toBeOnTheScreen();
  expect(screen.getByLabelText('Loading results')).toBeOnTheScreen();

  answer.open();

  expect(await screen.findByRole('header', { name: '1 Result Found' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading results')).not.toBeOnTheScreen();
});

test('a search that matches no movies opens Results with a count of 0 and says so, with the text as the user typed it', async () => {
  serveSearch({});

  await submitSearch(' Xyzzy ');

  expect(await screen.findByRole('header', { name: '0 Results Found' })).toBeOnTheScreen();
  expect(screen.getByText("No movies match 'Xyzzy'")).toBeOnTheScreen();
});

test('when the search fails, Results shows an error state, and Retry recovers', async () => {
  serveSearch({}, { fail: { dune: 500 } });
  const user = await submitSearch('Dune');
  expect(await screen.findByText("Couldn't search for movies")).toBeOnTheScreen();
  expect(screen.getByText('TMDb had a problem. Try again in a moment.')).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Results' })).toBeOnTheScreen();

  // Search, under Results, has waited out its pause by now. The search stays failed until the user retries
  const search = serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two' })] });
  await letSearchSettle();
  expect(screen.getByText("Couldn't search for movies")).toBeOnTheScreen();
  expect(search.queries).toEqual([]);

  await user.press(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.queryByText("Couldn't search for movies")).not.toBeOnTheScreen();
});

test('offline, Results for a term not searched before says search needs a connection, and shows the movies once it is back', async () => {
  await goOffline();
  await submitSearch('Dune');

  expect(await screen.findByText("You're offline")).toBeOnTheScreen();
  expect(screen.getByText('Connect to the internet to search for movies.')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading results')).not.toBeOnTheScreen();

  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two' })] });
  await goOnline();

  expect(await screen.findByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.queryByText("You're offline")).not.toBeOnTheScreen();
});

test('offline, Results for a term searched earlier in the session shows its movies under an offline banner', async () => {
  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two' })] });
  const user = await openTopResults('Dune');
  await goOffline();

  await pressSearchKey(user);

  expect(screen.getByRole('header', { name: '1 Result Found' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.getByText("You're offline. Showing results from earlier.")).toBeOnTheScreen();

  await goOnline();

  expect(screen.queryByText(/You're offline/)).not.toBeOnTheScreen();
});

test('while the next page loads, Results shows a placeholder row below the movies', async () => {
  const matches = { dune: [fullPage(), [tmdbMovie({ title: 'Dune: Part Two' })]] };
  serveSearch(matches);
  const user = await submitSearch('Dune');
  const results = await screen.findByLabelText('Results');
  const nextPage = gate();
  serveSearch(matches, { hold: { dune: nextPage.opened } });

  await user.scrollTo(results, { y: 1100 });
  expect(await screen.findByLabelText('Loading more results')).toBeOnTheScreen();
  nextPage.open();

  expect(await screen.findByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading more results')).not.toBeOnTheScreen();
});

test('when the next page fails, Results keeps its movies and offers Retry below them, which loads the page', async () => {
  const matches = { dune: [fullPage(), [tmdbMovie({ title: 'Dune: Part Two' })]] };
  serveSearch(matches);
  const user = await submitSearch('Dune');
  const results = await screen.findByLabelText('Results');
  serveSearch({}, { fail: { dune: 500 } });

  await user.scrollTo(results, { y: 1100 });
  expect(await screen.findByText("Couldn't load more results")).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Opening 20' })).toBeOnTheScreen();

  const retried = gate();
  serveSearch(matches, { hold: { dune: retried.opened } });
  await user.press(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByLabelText('Loading more results')).toBeOnTheScreen();
  expect(screen.queryByText("Couldn't load more results")).not.toBeOnTheScreen();

  retried.open();

  expect(await screen.findByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.queryByLabelText('Loading more results')).not.toBeOnTheScreen();
});

test('Results keeps its count and its movies when the phone rotates to landscape', async () => {
  serveSearch({ dune: [tmdbMovie({ title: 'Dune' }), tmdbMovie({ title: 'Dune: Part Two' })] });
  await submitSearch('Dune');
  await screen.findByRole('button', { name: 'Dune' });

  await rotateToLandscape();

  expect(await screen.findByRole('button', { name: 'Dune' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.getByRole('header', { name: '2 Results Found' })).toBeOnTheScreen();
});

test('Results are not saved: after a restart offline, a search submitted before needs a connection', async () => {
  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two' })] });
  await submitSearch('Dune');
  await screen.findByRole('button', { name: 'Dune: Part Two' });
  await letDiskSettle();
  await screen.unmount();
  await goOffline();

  await submitSearch('Dune');

  expect(await screen.findByText("You're offline")).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Dune: Part Two' })).not.toBeOnTheScreen();
});
