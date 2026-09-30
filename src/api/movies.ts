import { tmdbGet } from './client';
import { toGenre } from './genres';
import { pickTrailer } from './trailer';
import type { TmdbMovie, TmdbMovieDetail, TmdbPage } from './tmdbTypes';
import type { Movie, MovieDetail, Paged } from './types';

// Without a region, TMDb's upcoming list is worldwide: in every language, with regional releases whose
// primary release date is long past. The app is English and prices in dollars, so it asks for US releases.
const UPCOMING_REGION = 'US';

function toMovie(movie: TmdbMovie): Movie {
  return {
    id: movie.id,
    title: movie.title,
    backdropPath: movie.backdrop_path,
    genreIds: movie.genre_ids,
  };
}

function toMoviePage(body: TmdbPage<TmdbMovie>): Paged<Movie> {
  return { items: body.results.map(toMovie), totalPages: body.total_pages, totalResults: body.total_results };
}

export async function fetchUpcomingMovies(page: number, signal: AbortSignal): Promise<Paged<Movie>> {
  const body = await tmdbGet<TmdbPage<TmdbMovie>>('/movie/upcoming', {
    params: { page, region: UPCOMING_REGION },
    signal,
  });
  return toMoviePage(body);
}

/** One page of the movies that match a search term. */
export async function searchMovies(term: string, page: number, signal: AbortSignal): Promise<Paged<Movie>> {
  const body = await tmdbGet<TmdbPage<TmdbMovie>>('/search/movie', { params: { query: term, page }, signal });
  return toMoviePage(body);
}

function toMovieDetail(movie: TmdbMovieDetail): MovieDetail {
  return {
    id: movie.id,
    title: movie.title,
    backdropPath: movie.backdrop_path,
    // TMDb sends an empty string for a date it doesn't have
    releaseDate: movie.release_date || null,
    genres: movie.genres.map(toGenre),
    overview: movie.overview,
    backdropPaths: movie.images.backdrops.map((image) => image.file_path),
    trailer: pickTrailer(movie.videos.results),
  };
}

/**
 * One request for a movie's detail, with its videos and images appended. Without include_image_language,
 * TMDb drops the images that have no language, which is most of a movie's backdrops.
 */
export async function fetchMovieDetail(id: number, signal: AbortSignal): Promise<MovieDetail> {
  const body = await tmdbGet<TmdbMovieDetail>(`/movie/${id}`, {
    params: { append_to_response: 'videos,images', include_image_language: 'en,null' },
    signal,
  });
  return toMovieDetail(body);
}
