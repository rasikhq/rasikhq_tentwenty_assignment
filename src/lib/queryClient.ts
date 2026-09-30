import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, type Query } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// A saved copy older than this is discarded on restore
const PERSIST_MAX_AGE = 7 * DAY;

// The upcoming list persists only as far as this many pages, which is what the user sees on reopening
const PERSISTED_UPCOMING_PAGES = 3;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // A failed request shows its error state at once and Retry is the recovery. TanStack's default of
        // three retries with backoff would keep the skeleton on screen for about 7 seconds first.
        retry: false,
        // Data older than this refetches when the app returns to the foreground, when the connection
        // comes back and when a screen mounts
        staleTime: HOUR,
        // A query is garbage-collected once nothing uses it for this long. It must be at least the
        // persister's max age, or entries would be dropped before they could be restored (ADR-0003).
        gcTime: PERSIST_MAX_AGE,
      },
    },
  });
}

type Persistable = Query & { queryKey: readonly unknown[] };

// The one place that decides what reaches the disk. Later tickets add their queries here.
function shouldPersist(query: Persistable) {
  return query.state.status === 'success' && query.queryKey[0] === 'upcoming';
}

// Pages beyond the first few stay in memory only
function trimForDisk(data: unknown) {
  const infinite = data as { pages?: unknown[]; pageParams?: unknown[] } | undefined;
  if (!infinite?.pages || !infinite.pageParams) return data;
  return {
    pages: infinite.pages.slice(0, PERSISTED_UPCOMING_PAGES),
    pageParams: infinite.pageParams.slice(0, PERSISTED_UPCOMING_PAGES),
  };
}

/** How the query cache is saved to AsyncStorage and restored from it. One per mounted app, like its client. */
export function createPersistOptions(): Omit<PersistQueryClientOptions, 'queryClient'> {
  return {
    persister: createAsyncStoragePersister({ storage: AsyncStorage }),
    maxAge: PERSIST_MAX_AGE,
    // A new app version may change the shape of the cached data, so it starts with an empty cache
    buster: Constants.expoConfig?.version ?? '',
    dehydrateOptions: { shouldDehydrateQuery: shouldPersist, serializeData: trimForDisk },
  };
}
