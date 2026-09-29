# Server state lives in TanStack Query, persisted for offline use

All TMDb data is server state that TMDb owns; the app keeps a cached copy in TanStack Query, while UI state (search text, seat selection) stays in React component state, so there is no global store. For offline-first, the query cache is persisted to AsyncStorage: the first 3 pages of the upcoming list, the details of movies the user has opened, and the genre list. Search and genre results stay in memory only. Queries refetch when the app returns to the foreground, when the connection comes back, and on pull-to-refresh.

## Considered Options

- **Redux Toolkit + RTK Query + redux-persist**: pays off with heavy client state shared across screens, which this app doesn't have.
- **Hand-rolled fetch and cache**: would re-implement deduping, retries, cancellation and stale-while-revalidate.
- **MMKV instead of AsyncStorage**: faster and synchronous, but two native dependencies for a cache that is capped and small.

## Consequences

- The persister writes the whole cache as a single value on every change. At 10× the data this is the first thing to strain; the path then is per-query persistence on MMKV.
- `gcTime` must be at least the persister's `maxAge`, or entries are garbage-collected before they are saved.
- The app never writes to TMDb, so there is no offline write queue and no sync conflict to resolve.
