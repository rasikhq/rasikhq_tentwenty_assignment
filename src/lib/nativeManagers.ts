import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

// TanStack Query watches the browser's focus and online events, which React Native doesn't have. These
// tell it when the app returns to the foreground and when the connection changes, so stale queries refetch.

focusManager.setEventListener((handleFocus) => {
  if (Platform.OS === 'web') return undefined;
  const subscription = AppState.addEventListener('change', (status) => handleFocus(status === 'active'));
  return () => subscription.remove();
});

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
);
