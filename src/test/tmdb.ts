import { http, HttpResponse } from 'msw';

import type { TmdbMovie, TmdbPage } from '../api/tmdbTypes';
import { server } from './server';

/** The token the app runs with in tests. The fake TMDb only answers requests that carry it. */
export const TEST_TOKEN = 'test-token';

const BASE_URL = 'https://api.themoviedb.org/3';

let lastMovieId = 0;

/** A movie as TMDb sends it. A test states only the fields it cares about. */
export function tmdbMovie(overrides: Partial<TmdbMovie> = {}): TmdbMovie {
  lastMovieId += 1;
  return { id: lastMovieId, title: `Movie ${lastMovieId}`, backdrop_path: '/backdrop.jpg', ...overrides };
}

/** A full page of TMDb results, 20 movies, which fills more than the screen. The given movies come last. */
export function fullPage(...lastMovies: TmdbMovie[]): TmdbMovie[] {
  const opening = Array.from({ length: 20 - lastMovies.length }, (_, index) =>
    tmdbMovie({ title: `Opening ${index + 1}` }),
  );
  return [...opening, ...lastMovies];
}

/** A gate that holds back a fake TMDb answer until the test opens it. */
export function gate() {
  let open!: () => void;
  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { opened, open };
}

/** How a fake TMDb request fails: with an HTTP error status, or with a dropped connection. */
type Failure = number | 'network';

function failureResponse(failure: Failure) {
  return failure === 'network'
    ? HttpResponse.error()
    : HttpResponse.json({ status_code: 0, status_message: 'Failed.', success: false }, { status: failure });
}

/** TMDb's answer to a request without a valid token. */
const invalidKey = {
  status_code: 7,
  status_message: 'Invalid API key: You must be granted a valid key.',
  success: false,
};

type ServeUpcomingOptions = {
  /** Answers for these pages, by page number, wait until the promise resolves, such as a gate's `opened`. */
  hold?: Record<number, Promise<void>>;
  /** Requests for these pages, by page number, fail. */
  failPages?: Record<number, Failure>;
};

/** Serves TMDb's upcoming movies, one array per page, to requests that carry the test token. */
export function serveUpcoming(
  pages: TmdbMovie[][],
  { hold = {}, failPages = {} }: ServeUpcomingOptions = {},
) {
  server.use(
    http.get(`${BASE_URL}/movie/upcoming`, async ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page') ?? 1);
      await hold[page];
      if (request.headers.get('Authorization') !== `Bearer ${TEST_TOKEN}`) {
        return HttpResponse.json(invalidKey, { status: 401 });
      }
      const failure = failPages[page];
      if (failure !== undefined) {
        return failureResponse(failure);
      }
      const body: TmdbPage<TmdbMovie> = {
        page,
        results: pages[page - 1] ?? [],
        total_pages: pages.length,
        total_results: pages.flat().length,
      };
      return HttpResponse.json(body);
    }),
  );
}

/** Makes TMDb's upcoming endpoint fail for every page. */
export function failUpcoming(failure: Failure) {
  server.use(http.get(`${BASE_URL}/movie/upcoming`, () => failureResponse(failure)));
}

/**
 * Makes TMDb's upcoming endpoint never answer. The result tells a test whether a request came in
 * and whether the app gave up on it.
 */
export function stallUpcoming() {
  const request = { received: false, cancelled: false };
  server.use(
    http.get(`${BASE_URL}/movie/upcoming`, ({ request: incoming }) => {
      request.received = true;
      incoming.signal.addEventListener('abort', () => {
        request.cancelled = true;
      });
      return new Promise<never>(() => {});
    }),
  );
  return request;
}
