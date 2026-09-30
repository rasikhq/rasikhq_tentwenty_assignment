import { tmdbGet } from './client';
import type { TmdbMovie, TmdbPage } from './tmdbTypes';
import type { Movie, Paged } from './types';

// Without a region, TMDb's upcoming list is worldwide: in every language, with regional releases whose
// primary release date is long past. The app is English and prices in dollars, so it asks for US releases.
const UPCOMING_REGION = 'US';

function toMovie(movie: TmdbMovie): Movie {
  return { id: movie.id, title: movie.title, backdropPath: movie.backdrop_path };
}

export async function fetchUpcomingMovies(page: number, signal: AbortSignal): Promise<Paged<Movie>> {
  const body = await tmdbGet<TmdbPage<TmdbMovie>>('/movie/upcoming', {
    params: { page, region: UPCOMING_REGION },
    signal,
  });
  return { items: body.results.map(toMovie), totalPages: body.total_pages };
}
