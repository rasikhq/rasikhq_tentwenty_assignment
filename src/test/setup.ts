import AsyncStorage from '@react-native-async-storage/async-storage';
import { timeoutManager } from '@tanstack/react-query';
import { cleanup } from '@testing-library/react-native';
import type * as ReactNative from 'react-native';

import { resetNetwork } from './network';
import { server } from './server';
import { TEST_TOKEN } from './tmdb';
import { resetWindow } from './window';

// Native modules have no native side in Jest, so each one gets its library's official mock as it arrives
jest.mock('react-native-safe-area-context', () =>
  jest.requireActual<{ default: unknown }>('react-native-safe-area-context/jest/mock').default,
);

// Jest has no native manifest, so the Expo config is app.json itself, which is where the app version lives
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: jest.requireActual<{ expo: object }>('../../app.json').expo },
}));

// The disk and the connection are faked at their libraries' own Jest mocks
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual<object>('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-native-community/netinfo', () =>
  jest.requireActual<object>('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

// PROTOTYPE (ticket 06): react-native-webview ships no Jest mock, and the harness screen imports it at
// load time through the root navigator. A bare View stands in for it on this branch only.
jest.mock('react-native-webview', () => {
  const { View } = jest.requireActual<typeof ReactNative>('react-native');
  return { __esModule: true, WebView: View, default: View };
});

// Jest has no layout pass, so FlashList measures nothing and renders no rows. This fixes the sizes it
// measures, as FlashList's own tests do. Its shipped jestSetup.js can't be used: in 2.0.2 it swaps
// FlashList for a `RecyclerView` export that the package no longer has.
jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => ({
  ...jest.requireActual<object>('@shopify/flash-list/dist/recyclerview/utils/measureLayout'),
  measureParentSize: () => ({ x: 0, y: 0, width: 400, height: 900 }),
  measureFirstChildLayout: () => ({ x: 0, y: 0, width: 400, height: 900 }),
  measureItemLayout: () => ({ x: 0, y: 0, width: 100, height: 100 }),
}));

// TanStack Query starts long timers, such as the 5 minutes an unused query stays cached. Unref'd, they
// no longer keep Jest's process alive after the tests end.
timeoutManager.setTimeoutProvider({
  setTimeout: (callback, delay) => setTimeout(callback, delay).unref(),
  clearTimeout: (timer) => clearTimeout(timer),
  setInterval: (callback, delay) => setInterval(callback, delay).unref(),
  clearInterval: (timer) => clearInterval(timer),
});

const unhandledRequests: string[] = [];

beforeEach(async () => {
  resetWindow();
  resetNetwork();
  await AsyncStorage.clear();
  // Jest doesn't load .env. Set on every test, so a test that deletes the token doesn't affect the next
  process.env.EXPO_PUBLIC_TMDB_TOKEN = TEST_TOKEN;
});

beforeAll(() => {
  // RNTL switches the act() environment on for every test and off inside its async helpers, findBy*
  // and user.*. The network drives this app, and updates from TanStack Query's timers and FlashList's
  // layout passes can land between those helpers, after a test's last assertion, and warn about a
  // missing act(). Off everywhere else, as it already is inside the helpers, the tests still wait
  // for the screen with findBy* and stay quiet.
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;

  server.listen({
    // Throwing makes MSW answer 500 instead of passing the request on to the real network. The app
    // may handle a 500 gracefully, so the recorded request fails the test once it ends.
    onUnhandledRequest(request) {
      const description = `${request.method} ${request.url}`;
      unhandledRequests.push(description);
      throw new Error(`No MSW handler for ${description}`);
    },
  });
});

afterEach(async () => {
  jest.useRealTimers();
  // Unmount first, so a request the app sends while unmounting counts against this test
  await cleanup();
  server.resetHandlers();
  const unhandled = unhandledRequests.splice(0);
  if (unhandled.length > 0) {
    throw new Error(`Requests without an MSW handler:\n${unhandled.join('\n')}`);
  }
});

afterAll(() => {
  server.close();
  // MSW stops intercepting here, so a request the app sends later, from a timer or a retry,
  // would reach the real network. Reject it instead.
  globalThis.fetch = () => Promise.reject(new Error('The app sent a request after its tests ended'));
});
