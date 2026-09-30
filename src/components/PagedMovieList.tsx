import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useRef, type ReactElement, type ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Movie } from '../api/types';
import { errorMessage } from '../lib/errorMessage';
import { useMovieColumnCount } from '../lib/layout';
import { ErrorState } from './ErrorState';

// FlashList reports the movies on screen only after they've been there for 250 ms by default. Tracking the
// first one is cheap, so it reports at once
const viewabilityConfig = { minimumViewTime: 0 };

/** Where an infinite query stands with its next page. A `useInfiniteQuery` result is one. */
type NextPage = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  error: Error | null;
  fetchNextPage: () => unknown;
};

type PagedMovieListProps = {
  /** What a screen reader calls the list. */
  label: string;
  /** The movies of the pages loaded so far. */
  movies: Movie[];
  renderMovie: ListRenderItem<Movie>;
  /** The space around the movies, in dp. */
  padding: number;
  nextPage: NextPage;
  /** Shown in place of the movies when there are none. */
  empty: ReactElement;
  /** Stands in for the next page, below the movies, while it loads. */
  nextPageSkeleton: ReactElement;
  /** What failed when the next page can't be loaded, such as "Couldn't load more movies". */
  nextPageErrorTitle: string;
  /** With onRefresh, the list can be pulled down to refresh, and this shows its spinner. */
  refreshing?: boolean;
  onRefresh?: () => void;
};

/**
 * A list of movies that loads its next page as the user reaches its end: one column below the wide
 * breakpoint, two above it. Below the movies it shows the next page loading, or failed with Retry.
 */
export function PagedMovieList({
  label,
  movies,
  renderMovie,
  padding,
  nextPage,
  empty,
  nextPageSkeleton,
  nextPageErrorTitle,
  refreshing,
  onRefresh,
}: PagedMovieListProps) {
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, error, fetchNextPage } = nextPage;
  const insets = useSafeAreaInsets();
  const columns = useMovieColumnCount();
  // The first movie on screen. A new column count starts a new list, which opens at this movie
  const firstVisibleIndex = useRef(0);

  let footer: ReactNode = null;
  if (isFetchingNextPage) {
    // Checked first: while Retry loads a page that failed, the query still holds the failure
    footer = nextPageSkeleton;
  } else if (isFetchNextPageError) {
    footer = (
      <ErrorState
        inline
        title={nextPageErrorTitle}
        message={errorMessage(error)}
        onRetry={() => void fetchNextPage()}
      />
    );
  }

  return (
    <FlashList
      // FlashList keeps the old row sizes when its column count changes, which left a gap between
      // two cards after rotating, so a new column count starts a new list
      key={columns}
      initialScrollIndex={firstVisibleIndex.current}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={({ viewableItems }) => {
        firstVisibleIndex.current = viewableItems[0]?.index ?? 0;
      }}
      accessibilityLabel={label}
      // The list scrolls under the home indicator, so its end pads by the bottom inset
      contentContainerStyle={{ padding, paddingBottom: padding + insets.bottom }}
      data={movies}
      renderItem={renderMovie}
      numColumns={columns}
      ListEmptyComponent={empty}
      ListFooterComponent={footer}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
          void fetchNextPage();
        }
      }}
    />
  );
}
