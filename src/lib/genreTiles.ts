import type { Genre, Movie } from '../api/types';

/** A genre as the genre grid shows it. */
export type GenreTile = {
  genre: Genre;
  /** TMDb's file path for the backdrop of a movie in the genre, or null when none of the movies is in it. */
  backdropPath: string | null;
};

/**
 * A tile for each genre, in the order of the genres, with the backdrop of one of these movies that is in
 * the genre. Tiles show different movies where they can: a genre takes the first of its movies that no
 * tile has yet, and shares one only when every one of its movies is taken.
 */
export function genreTiles(genres: Genre[], movies: Movie[]): GenreTile[] {
  const withBackdrop = movies.filter((movie) => movie.backdropPath !== null);
  const candidates = genres.map((genre) => ({
    genre,
    // A movie saved on the device before list movies carried their genres has no genre ids, and the cache
    // buster wasn't bumped for them, so such a movie is in no genre
    inGenre: withBackdrop.filter((movie) => (movie.genreIds as number[] | undefined)?.includes(genre.id)),
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
