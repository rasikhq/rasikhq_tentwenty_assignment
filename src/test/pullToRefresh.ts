import { act } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import type { TestInstance } from 'test-renderer';

type RefreshControlElement = ReactElement<{ onRefresh?: () => void }>;

/**
 * Pulls a list down to refresh it. The pull gesture is native and Jest has none, so this calls the
 * onRefresh handler of the list's RefreshControl, as the native gesture does.
 */
export async function pullToRefresh(list: TestInstance) {
  const refreshControl = list.props.refreshControl as RefreshControlElement | undefined;
  const onRefresh = refreshControl?.props.onRefresh;
  if (!onRefresh) {
    throw new Error('The list cannot be pulled to refresh: it has no RefreshControl with onRefresh');
  }
  await act(() => {
    onRefresh();
  });
}
