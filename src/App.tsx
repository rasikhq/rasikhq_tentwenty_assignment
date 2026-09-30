import './global.css';

import { NavigationContainer, type InitialState } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createQueryClient } from './lib/queryClient';
import { RootNavigator } from './navigation/RootNavigator';

type AppProps = {
  /** Where navigation starts. Only tests pass it; the app itself always opens on Movie List. */
  initialNavigationState?: InitialState;
};

export default function App({ initialNavigationState }: AppProps) {
  // One client per mounted app, so every render starts with an empty cache
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer initialState={initialNavigationState}>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
