import { screen } from '@testing-library/react-native';

import { renderApp } from '../test/renderApp';

test('the app opens on Movie List, under the Watch header', async () => {
  await renderApp();

  expect(screen.getByRole('header', { name: 'Watch' })).toBeOnTheScreen();
});
