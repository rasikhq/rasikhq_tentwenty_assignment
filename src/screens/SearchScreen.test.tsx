import { screen, userEvent, waitFor } from '@testing-library/react-native';

import { SEARCH_DEBOUNCE_MS } from '../hooks/useMovieSearch';
import { controlDate, passDays } from '../test/clock';
import { letDiskSettle } from '../test/disk';
import { goOffline, goOnline } from '../test/network';
import { renderApp } from '../test/renderApp';
import { letSearchSettle } from '../test/search';
import {
  gate,
  serveGenres,
  serveMovieDetail,
  serveSearch,
  serveUpcoming,
  tmdbMovie,
  tmdbMovieDetail,
} from '../test/tmdb';

// Search asks TMDb for the genre list as it opens. A test that shows genre names serves its own.
beforeEach(() => {
  serveGenres();
});

/** Opens the app on Movie list and taps its search button. */
async function openSearchFromMovieList() {
  const user = userEvent.setup();
  serveUpcoming([[tmdbMovie()]]);
  await renderApp();
  await user.press(await screen.findByRole('button', { name: 'Search' }));
  return user;
}

/** Opens the app on Search and types into its field. */
async function openSearchAndType(text: string) {
  const user = userEvent.setup();
  await renderApp({ name: 'Search' });
  await user.type(screen.getByPlaceholderText('Search movies'), text);
  return user;
}

test("Movie list's search button opens Search, which asks for a title before any typing", async () => {
  await openSearchFromMovieList();

  expect(screen.getByPlaceholderText('Search movies')).toBeOnTheScreen();
  expect(screen.getByText('Search for a movie by its title.')).toBeOnTheScreen();
});

test('with the search field empty, its button closes Search and returns to Movie list', async () => {
  const user = await openSearchFromMovieList();

  await user.press(screen.getByRole('button', { name: 'Close search' }));

  expect(screen.queryByPlaceholderText('Search movies')).not.toBeOnTheScreen();
  expect(screen.getByRole('header', { name: 'Watch' })).toBeOnTheScreen();
});

test('with text in the search field, its button clears the text and Search stays open', async () => {
  const user = await openSearchFromMovieList();
  const field = screen.getByPlaceholderText('Search movies');
  await user.type(field, '   ');
  expect(screen.queryByRole('button', { name: 'Close search' })).not.toBeOnTheScreen();

  await user.press(screen.getByRole('button', { name: 'Clear search' }));

  expect(field).toHaveDisplayValue('');
  expect(screen.getByRole('button', { name: 'Close search' })).toBeOnTheScreen();
});

test('typing shows the Top Results for the text in the field', async () => {
  serveSearch({ dune: [tmdbMovie({ title: 'Dune' }), tmdbMovie({ title: 'Dune: Part Two' })] });

  await openSearchAndType('Dune');

  expect(await screen.findByRole('button', { name: 'Dune' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.getByText('Top Results')).toBeOnTheScreen();
  expect(screen.queryByText('Search for a movie by its title.')).not.toBeOnTheScreen();
});

test('when TMDb answers an older search term last, its results never show', async () => {
  const olderAnswer = gate();
  const search = serveSearch(
    { dune: [tmdbMovie({ title: 'Dune (1984)' })], 'dune part': [tmdbMovie({ title: 'Dune: Part Two' })] },
    { hold: { dune: olderAnswer.opened } },
  );
  const user = await openSearchAndType('dune');
  await waitFor(() => expect(search.queries).toContain('dune'));

  await user.type(screen.getByPlaceholderText('Search movies'), ' part');
  expect(await screen.findByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  olderAnswer.open();
  await letSearchSettle();

  expect(screen.queryByRole('button', { name: 'Dune (1984)' })).not.toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
});

test('while the current search term waits for TMDb, a searching row shows instead of the previous results', async () => {
  const answer = gate();
  serveSearch(
    { dune: [tmdbMovie({ title: 'Dune (1984)' })], 'dune part': [tmdbMovie({ title: 'Dune: Part Two' })] },
    { hold: { 'dune part': answer.opened } },
  );
  const user = await openSearchAndType('dune');
  await screen.findByRole('button', { name: 'Dune (1984)' });

  await user.type(screen.getByPlaceholderText('Search movies'), ' part');

  expect(screen.getByLabelText('Searching')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Dune (1984)' })).not.toBeOnTheScreen();

  answer.open();

  expect(await screen.findByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.queryByLabelText('Searching')).not.toBeOnTheScreen();
});

test('typing a word asks TMDb once, for the whole word, not once per letter', async () => {
  const search = serveSearch({ dune: [tmdbMovie({ title: 'Dune' })] });

  await openSearchAndType('dune');

  expect(await screen.findByRole('button', { name: 'Dune' })).toBeOnTheScreen();
  expect(search.queries).toEqual(['dune']);
});

test('a search TMDb has not answered yet is cancelled when the user types on', async () => {
  const search = serveSearch({}, { hold: { dune: gate().opened } });
  const user = await openSearchAndType('dune');
  await waitFor(() => expect(search.queries).toEqual(['dune']));

  await user.type(screen.getByPlaceholderText('Search movies'), 's');

  await waitFor(() => expect(search.cancelled).toEqual(['dune']));
});

test('backspacing to a term searched before shows its results at once, without asking TMDb again', async () => {
  const search = serveSearch({
    dune: [tmdbMovie({ title: 'Dune: Part Two' })],
    dunes: [tmdbMovie({ title: 'Woman in the Dunes' })],
  });
  const user = await openSearchAndType('dune');
  await screen.findByRole('button', { name: 'Dune: Part Two' });
  await user.type(screen.getByPlaceholderText('Search movies'), 's');
  await screen.findByRole('button', { name: 'Woman in the Dunes' });

  await user.type(screen.getByPlaceholderText('Search movies'), '{Backspace}');

  expect(screen.getByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.queryByLabelText('Searching')).not.toBeOnTheScreen();
  await letSearchSettle();
  expect(search.queries).toEqual(['dune', 'dunes']);
});

test('a search that matches no movies says so, with the text as the user typed it', async () => {
  serveSearch({});

  await openSearchAndType(' Xyzzy ');

  expect(await screen.findByText("No movies match 'Xyzzy'")).toBeOnTheScreen();
  expect(screen.queryByText('Top Results')).not.toBeOnTheScreen();
});

test('a search that fails shows an error state, and Retry recovers', async () => {
  serveSearch({}, { fail: { dune: 500 } });
  const user = await openSearchAndType('dune');
  expect(await screen.findByText("Couldn't search for movies")).toBeOnTheScreen();
  expect(screen.getByText('TMDb had a problem. Try again in a moment.')).toBeOnTheScreen();

  serveSearch({ dune: [tmdbMovie({ title: 'Dune' })] });
  await user.press(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByRole('button', { name: 'Dune' })).toBeOnTheScreen();
  expect(screen.queryByText("Couldn't search for movies")).not.toBeOnTheScreen();
});

test('offline, a term not searched before says search needs a connection', async () => {
  await goOffline();

  await openSearchAndType('dune');

  expect(screen.getByText("You're offline")).toBeOnTheScreen();
  expect(screen.getByText('Connect to the internet to search for movies.')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen();
  expect(screen.queryByLabelText('Searching')).not.toBeOnTheScreen();
});

test('offline, a term searched earlier in the session still shows its results, under an offline banner', async () => {
  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two' })] });
  const user = await openSearchAndType('dune');
  await screen.findByRole('button', { name: 'Dune: Part Two' });
  await goOffline();

  await user.type(screen.getByPlaceholderText('Search movies'), 's');
  expect(screen.getByText("You're offline")).toBeOnTheScreen();
  await user.type(screen.getByPlaceholderText('Search movies'), '{Backspace}');

  expect(screen.getByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.getByText("You're offline. Showing results from earlier.")).toBeOnTheScreen();
  expect(screen.queryByText("You're offline")).not.toBeOnTheScreen();

  await goOnline();

  expect(screen.queryByText(/You're offline/)).not.toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
});

test('when the connection comes back, the search that waited for it shows its results', async () => {
  await goOffline();
  await openSearchAndType('dune');
  expect(screen.getByText("You're offline")).toBeOnTheScreen();

  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two' })] });
  await goOnline();

  expect(await screen.findByRole('button', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.queryByText("You're offline")).not.toBeOnTheScreen();
});

test("a Top Results row shows the name of the movie's first genre", async () => {
  serveGenres([
    { id: 12, name: 'Adventure' },
    { id: 878, name: 'Science Fiction' },
  ]);
  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two', genre_ids: [878, 12] })] });

  await openSearchAndType('dune');

  expect(await screen.findByRole('button', { name: 'Dune: Part Two, Science Fiction' })).toBeOnTheScreen();
  expect(screen.getByText('Science Fiction')).toBeOnTheScreen();
  expect(screen.queryByText('Adventure')).not.toBeOnTheScreen();
});

test('after a restart, rows show genre names from the saved genre list, without asking TMDb for it again', async () => {
  const genres = serveGenres([{ id: 878, name: 'Science Fiction' }]);
  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two', genre_ids: [878] })] });
  await openSearchAndType('dune');
  await screen.findByRole('button', { name: 'Dune: Part Two, Science Fiction' });
  await letDiskSettle();
  await screen.unmount();

  await openSearchAndType('dune');

  expect(await screen.findByRole('button', { name: 'Dune: Part Two, Science Fiction' })).toBeOnTheScreen();
  expect(genres.requests).toBe(1);
});

test('Search asks TMDb for the genre list again only once it is more than 7 days old', async () => {
  controlDate();
  const genres = serveGenres();
  const user = await openSearchFromMovieList();
  await waitFor(() => expect(genres.requests).toBe(1));
  await user.press(screen.getByRole('button', { name: 'Close search' }));

  passDays(6);
  await user.press(screen.getByRole('button', { name: 'Search' }));
  await letSearchSettle();
  expect(genres.requests).toBe(1);
  await user.press(screen.getByRole('button', { name: 'Close search' }));

  passDays(2);
  await user.press(screen.getByRole('button', { name: 'Search' }));

  await waitFor(() => expect(genres.requests).toBe(2));
});

test('search results are not saved: after a restart offline, a term searched before needs a connection', async () => {
  serveSearch({ dune: [tmdbMovie({ title: 'Dune: Part Two' })] });
  await openSearchAndType('dune');
  await screen.findByRole('button', { name: 'Dune: Part Two' });
  await letDiskSettle();
  await screen.unmount();
  await goOffline();

  await openSearchAndType('dune');

  expect(screen.getByText("You're offline")).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Dune: Part Two' })).not.toBeOnTheScreen();
});

test('tapping a Top Results row opens Movie detail with the title from the row before the rest arrives', async () => {
  const answer = gate();
  const detail = tmdbMovieDetail({ title: 'Dune: Part Two', overview: 'Paul Atreides unites with the Fremen.' });
  serveMovieDetail(detail, { hold: answer.opened });
  serveSearch({ dune: [tmdbMovie({ id: detail.id, title: 'Dune: Part Two' })] });
  const user = await openSearchAndType('dune');

  await user.press(await screen.findByRole('button', { name: 'Dune: Part Two' }));

  expect(screen.getByRole('header', { name: 'Dune: Part Two' })).toBeOnTheScreen();
  expect(screen.queryByText('Paul Atreides unites with the Fremen.')).not.toBeOnTheScreen();

  answer.open();

  expect(await screen.findByText('Paul Atreides unites with the Fremen.')).toBeOnTheScreen();
});

test('returning to a term whose search was cancelled waits out the pause again before asking TMDb', async () => {
  const search = serveSearch({}, { hold: { dune: gate().opened } });
  const user = await openSearchAndType('dune');
  await waitFor(() => expect(search.queries).toEqual(['dune']));

  await user.type(screen.getByPlaceholderText('Search movies'), 's{Backspace}');
  // Well inside the pause: a request that skipped it would have arrived by now
  await new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS / 3));

  expect(search.queries).toEqual(['dune']);
  await waitFor(() => expect(search.queries).toEqual(['dune', 'dune']));
});
