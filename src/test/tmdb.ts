import { http, HttpResponse } from 'msw';

import type { TmdbGenre, TmdbGenreList, TmdbMovie, TmdbMovieDetail, TmdbPage, TmdbVideo } from '../api/tmdbTypes';
import { server } from './server';

/** The token the app runs with in tests. The fake TMDb only answers requests that carry it. */
export const TEST_TOKEN = 'test-token';

const BASE_URL = 'https://api.themoviedb.org/3';

let lastMovieId = 0;

/** A movie as TMDb sends it. A test states only the fields it cares about. */
export function tmdbMovie(overrides: Partial<TmdbMovie> = {}): TmdbMovie {
  lastMovieId += 1;
  return {
    id: lastMovieId,
    title: `Movie ${lastMovieId}`,
    backdrop_path: '/backdrop.jpg',
    genre_ids: [],
    ...overrides,
  };
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

type ServeGenresOptions = {
  /** The answer waits until the promise resolves, such as a gate's `opened`. */
  hold?: Promise<void>;
  /** The request fails. */
  fail?: Failure;
};

/** Serves TMDb's genre list to requests that carry the test token. The result counts the requests that came in. */
export function serveGenres(genres: TmdbGenre[] = [], { hold, fail }: ServeGenresOptions = {}) {
  const served = { requests: 0 };
  server.use(
    http.get(`${BASE_URL}/genre/movie/list`, async ({ request }) => {
      served.requests += 1;
      await hold;
      if (request.headers.get('Authorization') !== `Bearer ${TEST_TOKEN}`) {
        return HttpResponse.json(invalidKey, { status: 401 });
      }
      if (fail !== undefined) {
        return failureResponse(fail);
      }
      const body: TmdbGenreList = { genres };
      return HttpResponse.json(body);
    }),
  );
  return served;
}

type ServeSearchOptions = {
  /** Answers for these queries wait until the promise resolves, such as a gate's `opened`. */
  hold?: Record<string, Promise<void>>;
  /** Requests for these queries fail. */
  fail?: Record<string, Failure>;
};

/** The movies a fake paged endpoint serves for one key: those of its one page, or one array per page. */
type MoviePages = TmdbMovie[] | TmdbMovie[][];

/** Whether the movies are given as pages, and not as the movies of the one page. */
function isPaged(movies: MoviePages): movies is TmdbMovie[][] {
  return Array.isArray(movies[0]);
}

/** TMDb's answer for one page of the movies. */
function moviePage(movies: MoviePages, page: number): TmdbPage<TmdbMovie> {
  const pages = isPaged(movies) ? movies : [movies];
  return {
    page,
    results: pages[page - 1] ?? [],
    total_pages: pages.length,
    total_results: pages.flat().length,
  };
}

/**
 * Serves TMDb's movie search: the movies that match each query, as the one page of its results, or one
 * array per page for a query with several. A query that isn't listed matches no movies. The result lists
 * the query of every request that came in, in order, and the queries whose request the app gave up on.
 */
export function serveSearch(matches: Record<string, MoviePages>, { hold = {}, fail = {} }: ServeSearchOptions = {}) {
  const served = { queries: [] as string[], cancelled: [] as string[] };
  server.use(
    http.get(`${BASE_URL}/search/movie`, async ({ request }) => {
      const params = new URL(request.url).searchParams;
      const query = params.get('query') ?? '';
      const page = Number(params.get('page') ?? 1);
      served.queries.push(query);
      request.signal.addEventListener('abort', () => {
        served.cancelled.push(query);
      });
      await hold[query];
      if (request.headers.get('Authorization') !== `Bearer ${TEST_TOKEN}`) {
        return HttpResponse.json(invalidKey, { status: 401 });
      }
      const failure = fail[query];
      if (failure !== undefined) {
        return failureResponse(failure);
      }
      return HttpResponse.json(moviePage(matches[query] ?? [], page));
    }),
  );
  return served;
}

type ServeGenreMoviesOptions = {
  /** Requests for these genres, by genre id, fail. */
  fail?: Record<number, Failure>;
};

/**
 * Serves TMDb's discover endpoint for the movies of a genre: the movies of each genre id, as the one page
 * of its movies, or one array per page for a genre with several. A genre that isn't listed has no movies.
 * The result lists the genre id of every request that came in, in order.
 */
export function serveGenreMovies(movies: Record<number, MoviePages>, { fail = {} }: ServeGenreMoviesOptions = {}) {
  const served = { genreIds: [] as number[] };
  server.use(
    http.get(`${BASE_URL}/discover/movie`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      const genreId = Number(params.get('with_genres'));
      const page = Number(params.get('page') ?? 1);
      served.genreIds.push(genreId);
      if (request.headers.get('Authorization') !== `Bearer ${TEST_TOKEN}`) {
        return HttpResponse.json(invalidKey, { status: 401 });
      }
      const failure = fail[genreId];
      if (failure !== undefined) {
        return failureResponse(failure);
      }
      return HttpResponse.json(moviePage(movies[genreId] ?? [], page));
    }),
  );
  return served;
}

/** A video as TMDb lists it for a movie: an official YouTube trailer, unless a test says otherwise. */
export function tmdbVideo(overrides: Partial<TmdbVideo> = {}): TmdbVideo {
  return { key: 'video-key', site: 'YouTube', type: 'Trailer', official: true, ...overrides };
}

/** A movie's full detail as TMDb sends it from /movie/{id}. A test states only the fields it cares about. */
export function tmdbMovieDetail(overrides: Partial<TmdbMovieDetail> = {}): TmdbMovieDetail {
  const { id, title, backdrop_path } = tmdbMovie();
  return {
    id,
    title,
    backdrop_path,
    release_date: '2021-12-22',
    overview: 'An overview of the movie.',
    genres: [],
    videos: { results: [] },
    images: { backdrops: [] },
    ...overrides,
  };
}

type ServeMovieDetailOptions = {
  /** The answer waits until the promise resolves, such as a gate's `opened`. */
  hold?: Promise<void>;
  /** The request fails. */
  fail?: Failure;
};

/**
 * Serves TMDb's detail for one movie, with the videos and images the app asks to have appended.
 * A request without them fails, so a test that shows the detail also proves the app asked for them.
 * The result counts the requests that came in.
 */
export function serveMovieDetail(
  detail: TmdbMovieDetail,
  { hold, fail }: ServeMovieDetailOptions = {},
) {
  const served = { requests: 0 };
  server.use(
    http.get(`${BASE_URL}/movie/${detail.id}`, async ({ request }) => {
      served.requests += 1;
      await hold;
      const params = new URL(request.url).searchParams;
      if (request.headers.get('Authorization') !== `Bearer ${TEST_TOKEN}`) {
        return HttpResponse.json(invalidKey, { status: 401 });
      }
      if (fail !== undefined) {
        return failureResponse(fail);
      }
      if (
        params.get('append_to_response') !== 'videos,images' ||
        params.get('include_image_language') !== 'en,null'
      ) {
        return failureResponse(400);
      }
      return HttpResponse.json(detail);
    }),
  );
  return served;
}
