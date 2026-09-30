import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { act } from '@testing-library/react-native';

let connected = true;
let reachable = true;
const listeners = new Set<(state: NetInfoState) => void>();

function netInfoState() {
  return {
    type: connected ? 'wifi' : 'none',
    isConnected: connected,
    isInternetReachable: connected && reachable,
  } as NetInfoState;
}

/**
 * Puts the phone online and gives the NetInfo mock a working addEventListener and refresh: like the real
 * ones, they report the current connection to a listener. The official mock reports nothing. Every test
 * starts online.
 */
export function resetNetwork() {
  connected = true;
  reachable = true;
  listeners.clear();
  jest.mocked(NetInfo.refresh).mockImplementation(() => {
    listeners.forEach((listener) => listener(netInfoState()));
    return Promise.resolve(netInfoState());
  });
  jest.mocked(NetInfo.addEventListener).mockImplementation((listener) => {
    listeners.add(listener);
    listener(netInfoState());
    return () => listeners.delete(listener);
  });
}

async function setConnected(value: boolean, isReachable = true) {
  connected = value;
  reachable = isReachable;
  await act(() => {
    listeners.forEach((listener) => listener(netInfoState()));
  });
}

/** The phone loses its connection, whether or not the app is open. */
export const goOffline = () => setConnected(false);

/** The phone gets its connection back. */
export const goOnline = () => setConnected(true);

/** The phone is on Wi-Fi that has no internet behind it. */
export const loseInternet = () => setConnected(true, false);

/** The connection returns, but the app is never told. Only asking NetInfo again finds out. */
export function reconnectUnnoticed() {
  connected = true;
  reachable = true;
}
