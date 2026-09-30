import './global.css';

import { NavigationContainer, type InitialState } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';

type AppProps = {
  /** Where navigation starts. Only tests pass it; the app itself always opens on Movie List. */
  initialNavigationState?: InitialState;
};

export default function App({ initialNavigationState }: AppProps) {
  return (
    <SafeAreaProvider>
      <NavigationContainer initialState={initialNavigationState}>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
