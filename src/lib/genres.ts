import type { Genre, Movie } from '../api/types';

/**
 * The name of a movie's first genre, which is the one a result row shows. Undefined when the movie has
 * no genre, or while the genre list hasn't arrived.
 */
export function firstGenreName(movie: Movie, genres: Genre[] | undefined): string | undefined {
  return genres?.find((genre) => genre.id === movie.genreIds[0])?.name;
}
