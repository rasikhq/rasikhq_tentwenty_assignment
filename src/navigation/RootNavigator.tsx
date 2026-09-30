import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MovieListScreen } from '../screens/MovieListScreen';

export type RootStackParamList = {
  MovieList: undefined;
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
    </Stack.Navigator>
  );
}
