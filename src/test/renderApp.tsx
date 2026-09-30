import { render } from '@testing-library/react-native';

import App from '../App';
import type { RootStackParamList } from '../navigation/RootNavigator';

/** A root stack route to start on, with params when the route takes them. */
type StartRoute = {
  [Name in keyof RootStackParamList]: RootStackParamList[Name] extends undefined
    ? { name: Name }
    : { name: Name; params: RootStackParamList[Name] };
}[keyof RootStackParamList];

/**
 * Renders the whole app the way a user opens it: the production providers around the real
 * root navigator. Pass a route to start there instead of Movie List.
 */
export async function renderApp(startRoute?: StartRoute) {
  return render(<App initialNavigationState={startRoute && { routes: [startRoute] }} />);
}
