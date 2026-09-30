import { tmdbGet } from './client';
import type { TmdbGenreList } from './tmdbTypes';
import type { Genre } from './types';

/** Every genre a movie can have, which is where the names of a list movie's genre ids come from. */
export async function fetchGenres(signal: AbortSignal): Promise<Genre[]> {
  const body = await tmdbGet<TmdbGenreList>('/genre/movie/list', { signal });
  return body.genres.map(({ id, name }) => ({ id, name }));
}
