import { act } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

const phonePortrait = { width: 390, height: 844, scale: 3, fontScale: 1 };
const phoneLandscape = { ...phonePortrait, width: 844, height: 390 };

/** Puts the window in phone portrait, where every test starts. React Native's Jest window is 750 wide, which counts as wide. */
export function resetWindow() {
  Dimensions.set({ window: phonePortrait, screen: phonePortrait });
}

/** Turns the phone to landscape while the app runs, as rotating it does. */
export async function rotateToLandscape() {
  await act(() => {
    Dimensions.set({ window: phoneLandscape, screen: phoneLandscape });
  });
}
