import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { Genre, Movie, Trailer } from '../api/types';
import type { Showtime } from '../lib/showtime';
import { MovieDetailScreen } from '../screens/MovieDetailScreen';
import { MovieListScreen } from '../screens/MovieListScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SeatMapScreen } from '../screens/SeatMapScreen';
import { TrailerScreen } from '../screens/TrailerScreen';

export type RootStackParamList = {
  MovieList: undefined;
  Search: undefined;
  /**
   * What Results lists, told apart by `kind`: the movies that match a search, with the search as the user
   * typed it, trimmed, or the movies of a genre.
   */
  Results: { kind: 'search'; text: string } | { kind: 'genre'; genre: Genre };
  /** The movie as the screen that opened it knows it: its image and title show until the detail arrives. */
  MovieDetail: { movie: Movie };
  Trailer: { trailer: Trailer };
  /** The showtime to pick seats for, with the title of its movie for the header. */
  SeatMap: { title: string; showtime: Showtime };
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
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      {/* Covers the whole screen and, like every screen, turns with the device */}
      <Stack.Screen name="Trailer" component={TrailerScreen} options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="SeatMap" component={SeatMapScreen} />
    </Stack.Navigator>
  );
}
