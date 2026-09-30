import { tmdbGet } from './client';
import type { TmdbGenre, TmdbGenreList } from './tmdbTypes';
import type { Genre } from './types';

export function toGenre({ id, name }: TmdbGenre): Genre {
  return { id, name };
}

/** Every genre a movie can have, which is where the names of a list movie's genre ids come from. */
export async function fetchGenres(signal: AbortSignal): Promise<Genre[]> {
  const body = await tmdbGet<TmdbGenreList>('/genre/movie/list', { signal });
  return body.genres.map(toGenre);
}
