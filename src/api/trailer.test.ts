import { tmdbVideo } from '../test/tmdb';
import { pickTrailer } from './trailer';

test('the official YouTube video of type Trailer is the trailer', () => {
  const videos = [tmdbVideo({ type: 'Featurette', key: 'featurette' }), tmdbVideo({ type: 'Trailer', key: 'trailer' })];

  expect(pickTrailer(videos)).toEqual({ videoKey: 'trailer' });
});

test('a movie with no Trailer takes its official YouTube Teaser as the trailer', () => {
  const videos = [tmdbVideo({ type: 'Clip', key: 'clip' }), tmdbVideo({ type: 'Teaser', key: 'teaser' })];

  expect(pickTrailer(videos)).toEqual({ videoKey: 'teaser' });
});

test('a Trailer wins over a Teaser that TMDb lists before it', () => {
  const videos = [tmdbVideo({ type: 'Teaser', key: 'teaser' }), tmdbVideo({ type: 'Trailer', key: 'trailer' })];

  expect(pickTrailer(videos)).toEqual({ videoKey: 'trailer' });
});

test.each([
  ['is not official', tmdbVideo({ official: false })],
  ['is on Vimeo', tmdbVideo({ site: 'Vimeo' })],
  ['is a Clip', tmdbVideo({ type: 'Clip' })],
  ['is a Featurette', tmdbVideo({ type: 'Featurette' })],
  ['is a Behind the Scenes', tmdbVideo({ type: 'Behind the Scenes' })],
])('a movie whose only video %s has no trailer', (_why, video) => {
  expect(pickTrailer([video])).toBeNull();
});

test('a movie with no videos has no trailer', () => {
  expect(pickTrailer([])).toBeNull();
});

test('an official Teaser wins over a Trailer that is not official', () => {
  const videos = [tmdbVideo({ type: 'Trailer', official: false, key: 'fan-trailer' }), tmdbVideo({ type: 'Teaser', key: 'teaser' })];

  expect(pickTrailer(videos)).toEqual({ videoKey: 'teaser' });
});

test('of several official YouTube Trailers, the first TMDb lists is the trailer', () => {
  const videos = [
    tmdbVideo({ site: 'Vimeo', key: 'vimeo' }),
    tmdbVideo({ key: 'first' }),
    tmdbVideo({ key: 'second' }),
  ];

  expect(pickTrailer(videos)).toEqual({ videoKey: 'first' });
});
