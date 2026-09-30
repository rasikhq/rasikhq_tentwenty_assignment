/**
 * The TMDb API Read Access Token, inlined from EXPO_PUBLIC_TMDB_TOKEN when the app is bundled.
 * A missing token throws setup instructions here, instead of surfacing later as TMDb's 401.
 */
export function readTmdbToken(): string {
  // Expo only inlines env vars read with this exact dot notation, so no destructuring
  const token = process.env.EXPO_PUBLIC_TMDB_TOKEN?.trim();
  if (!token) {
    throw new Error(
      'EXPO_PUBLIC_TMDB_TOKEN is not set. Copy .env.example to .env, paste your TMDb API Read Access Token, then restart Metro with `npm start -- --clear`.',
    );
  }
  return token;
}
