import { TmdbError, type TmdbErrorKind } from './errors';
import { readTmdbToken } from './token';

const BASE_URL = 'https://api.themoviedb.org/3';

type GetOptions = {
  params?: Record<string, string | number>;
  /** The query's AbortSignal: TanStack Query aborts it when nobody waits for the request any more. */
  signal: AbortSignal;
};

function kindForStatus(status: number): TmdbErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 404) return 'notFound';
  if (status === 429) return 'rateLimited';
  // Any other failure, such as a 500 or a 400 for a bad page, is one the user can only retry
  return 'server';
}

/**
 * GETs a TMDb endpoint, authenticated with the Read Access Token as a Bearer header, and returns
 * its JSON. Failures throw a TmdbError.
 */
export async function tmdbGet<T>(path: string, { params = {}, signal }: GetOptions): Promise<T> {
  // Built by hand: React Native's URLSearchParams has only part of the web API
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  const token = readTmdbToken();
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}${query && `?${query}`}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    // A cancelled request rejects too. That's no failure to report: nobody waits for it any more
    if (signal.aborted) throw error;
    // fetch rejects, without a status, when the device is offline or the connection breaks
    throw new TmdbError('network', 'The request to TMDb failed before TMDb answered', { cause: error });
  }
  if (!response.ok) {
    throw new TmdbError(kindForStatus(response.status), `TMDb responded with HTTP ${response.status}`);
  }
  const body: unknown = await response.json();
  return body as T;
}
