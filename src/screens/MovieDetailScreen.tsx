import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ErrorState } from '../components/ErrorState';
import { ImageStrip } from '../components/ImageStrip';
import { MovieDetailSkeleton } from '../components/MovieDetailSkeleton';
import { MovieHero } from '../components/MovieHero';
import { OfflineBanner } from '../components/OfflineBanner';
import { OfflineState } from '../components/OfflineState';
import { Skeleton } from '../components/Skeleton';
import { Text } from '../components/Text';
import { useIsOnline } from '../hooks/useIsOnline';
import { useMovieDetail } from '../hooks/useMovieDetail';
import { isBookable } from '../lib/bookable';
import { formatDate } from '../lib/dates';
import { errorMessage } from '../lib/errorMessage';
import { useIsWide } from '../lib/layout';
import type { RootStackParamList } from '../navigation/RootNavigator';

/** "In Theaters <date>" for a bookable movie, "Released <date>" for any other, and nothing without a date. */
function releaseLine(releaseDate: string | null): string | null {
  if (releaseDate === null) return null;
  return `${isBookable(releaseDate) ? 'In Theaters' : 'Released'} ${formatDate(releaseDate)}`;
}

export function MovieDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'MovieDetail'>) {
  const { movie } = route.params;
  const { data: detail, error, fetchStatus, refetch } = useMovieDetail(movie.id);
  const isOnline = useIsOnline();
  const isWide = useIsWide();
  const insets = useSafeAreaInsets();
  // Until the detail arrives, the movie from the list stands in for it: it has the image and the title
  const shown = detail ?? movie;
  // Offline with nothing saved, the request waits for a connection and no error ever arrives
  const isWaitingForConnection = !detail && fetchStatus === 'paused';
  const isLoading = !detail && !error && !isWaitingForConnection;

  const release = detail && releaseLine(detail.releaseDate);
  // A detail saved before the app read trailers has none
  const trailer = detail?.trailer;
  const hero = (
    <MovieHero title={shown.title} backdropPath={shown.backdropPath} fill={isWide}>
      {release && <Text variant="heroSubtitle">{release}</Text>}
      {isLoading && <Skeleton className="h-5 w-[160px] rounded" />}
      {trailer && (
        <View className="flex-row pt-2">
          <Button
            variant="outline"
            label="Watch Trailer"
            onPress={() => navigation.navigate('Trailer', { trailer })}
          />
        </View>
      )}
    </MovieHero>
  );

  let content: ReactNode;
  if (detail) {
    content = (
      <View className="gap-5">
        {!isOnline && <OfflineBanner message="You're offline. Showing saved details." />}
        {detail.genres.length > 0 && (
          <View className="flex-row flex-wrap gap-2 px-5">
            {detail.genres.map((genre, index) => (
              <Chip key={genre.id} label={genre.name} index={index} />
            ))}
          </View>
        )}
        {detail.overview !== '' && (
          <View className="px-5">
            <Text variant="body">{detail.overview}</Text>
          </View>
        )}
        {detail.backdropPaths.length > 0 && <ImageStrip paths={detail.backdropPaths} />}
      </View>
    );
  } else if (isWaitingForConnection) {
    content = (
      <OfflineState
        inline
        message="Connect to the internet to load this movie's details."
        onRetry={() => void refetch()}
      />
    );
  } else if (error) {
    content = (
      <ErrorState
        inline
        title="Couldn't load this movie"
        message={errorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  } else {
    content = <MovieDetailSkeleton />;
  }

  return (
    <View className="flex-1 bg-off-white">
      {/* Portrait: the image runs under the status bar, so its icons go light.
          Wide: the halves start below it, over the page. */}
      <StatusBar style={isWide ? 'dark' : 'light'} />
      {isWide ? (
        // The image takes the left half, and the content scrolls beside it
        <View className="flex-1 flex-row pt-safe">
          <View className="flex-1">{hero}</View>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 20, paddingBottom: 20 + insets.bottom }}
          >
            <View className="pr-safe">{content}</View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}>
          {hero}
          <View className="pt-5">{content}</View>
        </ScrollView>
      )}
      {/* A transparent header: only the back button, over the image */}
      <View className="absolute left-0 top-0 pl-safe pt-safe">
        <View className="p-2">
          <BackButton onImage onPress={navigation.goBack} />
        </View>
      </View>
    </View>
  );
}
