import { act } from '@testing-library/react-native';
import { AppState } from 'react-native';

/** Sends the app to the background and back to the foreground, as the user switching apps does. */
export async function returnToForeground() {
  const changes = jest.mocked(AppState).addEventListener.mock.calls.filter(([type]) => type === 'change');
  await act(() => {
    for (const [, listener] of changes) {
      listener('background');
      listener('active');
    }
  });
}
