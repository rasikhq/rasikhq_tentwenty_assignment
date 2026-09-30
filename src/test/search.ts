import { SEARCH_DEBOUNCE_MS } from '../hooks/useTopResults';

/**
 * Waits longer than Search pauses after the last keystroke, so any request the app was going to send has
 * gone out and its answer has reached the screen. For a test that expects no request, or no change on screen.
 */
export function letSearchSettle() {
  return new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 100));
}
