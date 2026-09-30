import { cleanup } from '@testing-library/react-native';

import { server } from './server';

// Native modules have no native side in Jest, so each one gets its library's official mock as it arrives
jest.mock('react-native-safe-area-context', () =>
  jest.requireActual<{ default: unknown }>('react-native-safe-area-context/jest/mock').default,
);

const unhandledRequests: string[] = [];

beforeAll(() => {
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
