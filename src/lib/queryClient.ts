import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      // A failed request shows its error state at once and Retry is the recovery. TanStack's default of
      // three retries with backoff would keep the skeleton on screen for about 7 seconds first.
      queries: { retry: false },
    },
  });
}
