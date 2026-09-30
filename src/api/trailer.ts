import type { TmdbVideo } from './tmdbTypes';
import type { Trailer } from './types';

// The video types that count as a trailer, best first
const TRAILER_TYPES = ['Trailer', 'Teaser'];

/**
 * The trailer rule: a movie's trailer is its official YouTube video of type "Trailer", or of type
 * "Teaser" when it has no such Trailer. A movie with neither has no trailer. Of several, the first
 * as TMDb lists them.
 */
export function pickTrailer(videos: TmdbVideo[]): Trailer | null {
  const candidates = videos.filter((video) => video.official && video.site === 'YouTube');
  for (const type of TRAILER_TYPES) {
    const video = candidates.find((candidate) => candidate.type === type);
    if (video) return { videoKey: video.key };
  }
  return null;
}
