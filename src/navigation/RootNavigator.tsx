import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { Movie } from '../api/types';
import { MovieDetailScreen } from '../screens/MovieDetailScreen';
import { MovieListScreen } from '../screens/MovieListScreen';

export type RootStackParamList = {
  MovieList: undefined;
  /** The movie as the screen that opened it knows it: its image and title show until the detail arrives. */
  MovieDetail: { movie: Movie };
};

// Types useNavigation() and <Link> across the app without passing the param list around
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    // Every screen draws its own Figma header, so the native header is hidden. The iOS swipe
    // and Android back still work; a screen that needs a back button draws it in its header.
    <Stack.Navigator initialRouteName="MovieList" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MovieList" component={MovieListScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
    </Stack.Navigator>
  );
}
