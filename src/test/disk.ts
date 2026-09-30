import AsyncStorage from '@react-native-async-storage/async-storage';
import { waitFor } from '@testing-library/react-native';

/**
 * Waits until the app has saved a movie to disk. The persister writes at most once a second, so a test
 * that "restarts" the app calls this first, or the restart would open on an empty disk.
 */
export async function waitForSavedMovie(title: string) {
  await waitFor(
    async () => {
      const saved = (await AsyncStorage.getItem('REACT_QUERY_OFFLINE_CACHE')) ?? '';
      expect(saved).toContain(title);
    },
    { timeout: 3000 },
  );
}

/** Lets the persister write once more, so what is on disk is the app's latest state. */
export async function letDiskSettle() {
  await new Promise((resolve) => setTimeout(resolve, 1200));
}
