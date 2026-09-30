import type { Genre, Movie } from '../api/types';

/** A genre with the backdrop its tile in the genre grid shows. */
export type GenreBackdrop = {
  genre: Genre;
  /** TMDb's file path for the backdrop of a movie in the genre, or null when none of the movies is in it. */
  backdropPath: string | null;
};

/**
 * Each genre, in the order given, with the backdrop of one of these movies that is in the genre. A genre
 * takes the first of its movies that no other genre has taken, and shares one only when every one of its
 * movies is taken. So most tiles show different movies, though not always as many as the movies allow.
 */
export function genreBackdrops(genres: Genre[], movies: Movie[]): GenreBackdrop[] {
  const withBackdrop = movies.filter((movie) => movie.backdropPath !== null);
  const candidates = genres.map((genre) => ({
    genre,
    inGenre: withBackdrop.filter((movie) => movie.genreIds.includes(genre.id)),
  }));
  // The genre with the fewest movies picks first, so a movie in several genres goes to the genre that has
  // no other
  const scarcestFirst = [...candidates].sort((a, b) => a.inGenre.length - b.inGenre.length);

  const takenMovieIds = new Set<number>();
  const backdropPaths = new Map<number, string | null>();
  for (const { genre, inGenre } of scarcestFirst) {
    const movie = inGenre.find((candidate) => !takenMovieIds.has(candidate.id)) ?? inGenre[0];
    if (movie) {
      takenMovieIds.add(movie.id);
      backdropPaths.set(genre.id, movie.backdropPath);
    }
  }

  return genres.map((genre) => ({ genre, backdropPath: backdropPaths.get(genre.id) ?? null }));
}
