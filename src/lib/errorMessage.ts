import { TmdbError, type TmdbErrorKind } from '../api/errors';

const messages: Record<TmdbErrorKind, string> = {
  unauthorized: 'The TMDb access token is missing or invalid. Check EXPO_PUBLIC_TMDB_TOKEN in your .env file.',
  notFound: "TMDb couldn't find what the app asked for.",
  rateLimited: 'TMDb is getting too many requests. Wait a moment, then try again.',
  network: "Can't reach TMDb. Check your connection and try again.",
  server: 'TMDb had a problem. Try again in a moment.',
};

/** The message a screen shows when a request failed. */
export function errorMessage(error: unknown): string {
  return error instanceof TmdbError ? messages[error.kind] : 'Something went wrong. Try again.';
}
