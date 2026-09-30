import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

// TanStack Query watches the browser's focus and online events, which React Native doesn't have. These
// tell it when the app returns to the foreground and when the connection changes, so stale queries refetch.

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (status) => handleFocus(status === 'active'));
  return () => subscription.remove();
});

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    // Wi-Fi without internet is connected but not reachable. A null reachability is still being
    // checked, which counts as online until NetInfo knows better.
    setOnline(Boolean(state.isConnected) && state.isInternetReachable !== false);
  }),
);

/** Asks NetInfo to check the connection again, which tells the query client if it changed unnoticed. */
export function recheckConnection() {
  return NetInfo.refresh();
}
