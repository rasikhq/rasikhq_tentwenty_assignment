import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { act } from '@testing-library/react-native';

let connected = true;
const listeners = new Set<(state: NetInfoState) => void>();

function netInfoState() {
  return {
    type: connected ? 'wifi' : 'none',
    isConnected: connected,
    isInternetReachable: connected,
  } as NetInfoState;
}

/**
 * Puts the phone online and gives the NetInfo mock a working addEventListener: like the real one, it
 * reports the current connection to a new listener at once. Every test starts online.
 */
export function resetNetwork() {
  connected = true;
  listeners.clear();
  jest.mocked(NetInfo.addEventListener).mockImplementation((listener) => {
    listeners.add(listener);
    listener(netInfoState());
    return () => listeners.delete(listener);
  });
}

async function setConnected(value: boolean) {
  connected = value;
  await act(() => {
    listeners.forEach((listener) => listener(netInfoState()));
  });
}

/** The phone loses its connection, whether or not the app is open. */
export const goOffline = () => setConnected(false);

/** The phone gets its connection back. */
export const goOnline = () => setConnected(true);
