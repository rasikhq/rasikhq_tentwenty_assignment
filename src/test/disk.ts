import { PERSIST_THROTTLE_MS } from '../lib/queryClient';

/**
 * Lets the app finish saving to disk, so a test that "restarts" it doesn't open on an empty disk.
 * The persister writes at most once per throttle interval, so two intervals cover the last write.
 */
export async function letDiskSettle() {
  await new Promise((resolve) => setTimeout(resolve, 2 * PERSIST_THROTTLE_MS));
}
