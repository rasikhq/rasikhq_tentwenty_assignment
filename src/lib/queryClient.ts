import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, type InfiniteData, type Query } from '@tanstack/react-query';
import type { PersistedClient, PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import Constants from 'expo-constants';

import { DAY } from './duration';
import { queryKeyRoots } from './queryKeys';

// A saved copy older than this is discarded on restore
const PERSIST_MAX_AGE = 7 * DAY;

/**
 * The persister writes at most once per this many milliseconds. Short, because a write still waiting
 * when the app is closed is lost.
 */
export const PERSIST_THROTTLE_MS = 300;

// The upcoming list persists only as far as this many pages, which is what the user sees on reopening
const PERSISTED_UPCOMING_PAGES = 3;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // A failed request shows its error state at once and Retry is the recovery. TanStack's default of
        // three retries with backoff would keep the skeleton on screen for about 7 seconds first.
        retry: false,
        // A query is garbage-collected once nothing uses it for this long. It must be at least the
        // persister's max age, or entries would be dropped before they could be restored (ADR-0003).
        gcTime: PERSIST_MAX_AGE,
      },
    },
  });
}

// What reaches the disk: the upcoming list, the detail of every movie the user has opened, and the genre
// list. Search results stay in memory only (ADR-0001).
const persistedQueries: readonly unknown[] = [
  queryKeyRoots.upcoming,
  queryKeyRoots.movieDetail,
  queryKeyRoots.genres,
];

// The one place that decides what reaches the disk. Later tickets add their queries here. A query whose
// refetch failed still holds its last data, which stays saved: a failed refresh must not wipe the copy.
function shouldPersist(query: Query) {
  return query.state.data !== undefined && persistedQueries.includes(query.queryKey[0]);
}

function isInfiniteData(data: unknown): data is InfiniteData<unknown> {
  return typeof data === 'object' && data !== null && 'pages' in data && 'pageParams' in data;
}

// A list's pages beyond the first few stay in memory only. Any other data is saved as it is.
function trimForDisk(data: unknown): unknown {
  if (!isInfiniteData(data)) return data;
  return {
    pages: data.pages.slice(0, PERSISTED_UPCOMING_PAGES),
    pageParams: data.pageParams.slice(0, PERSISTED_UPCOMING_PAGES),
  };
}

function appVersion() {
  const version = Constants.expoConfig?.version;
  if (!version) {
    // Without a version there is no buster, and a saved copy could outlive a change to its shape
    throw new Error('The app version is missing from the Expo config');
  }
  return version;
}

/**
 * How the query cache is saved to AsyncStorage and restored from it. One per mounted app, like its client.
 */
export function createPersistOptions(): Omit<PersistQueryClientOptions, 'queryClient'> {
  const storage = createAsyncStoragePersister({ storage: AsyncStorage, throttleTime: PERSIST_THROTTLE_MS });
  return {
    persister: {
      ...storage,
      // The provider discards a whole copy once it is older than the max age, and the copy is dated by its
      // last write. A copy also holds queries of different ages: a detail opened a week ago sits beside a
      // list refreshed yesterday. Each saved query expires on its own age, so an old detail is dropped and
      // never takes the fresher queries with it.
      restoreClient: async () => {
        const client = await storage.restoreClient();
        return client && withoutExpiredQueries(client);
      },
    },
    maxAge: PERSIST_MAX_AGE,
    // A new app version may change the shape of the cached data, so it starts with an empty cache
    buster: appVersion(),
    dehydrateOptions: {
      shouldDehydrateQuery: shouldPersist,
      serializeData: trimForDisk,
    },
  };
}

function withoutExpiredQueries(client: PersistedClient): PersistedClient {
  const oldestAllowed = Date.now() - PERSIST_MAX_AGE;
  const queries = client.clientState.queries.filter((query) => query.state.dataUpdatedAt >= oldestAllowed);
  return { ...client, clientState: { ...client.clientState, queries } };
}
