import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { Button } from '../components/Button';
import { CloseButton } from '../components/CloseButton';
import { ErrorState } from '../components/ErrorState';
import { OfflineState } from '../components/OfflineState';
import { TrailerPlayer } from '../components/TrailerPlayer';
import { useIsOnline } from '../hooks/useIsOnline';
import { openLink } from '../lib/openLink';
import type { RootStackParamList } from '../navigation/RootNavigator';

/** Why the trailer isn't playing: the phone was offline, or the player reported that it can't play it. */
type Failure = 'offline' | 'player';

/** The trailer's page on YouTube, where it plays even when its owner doesn't allow it in other apps. */
function youtubeUrl(videoKey: string) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoKey)}`;
}

export function TrailerScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Trailer'>) {
  const { trailer } = route.params;
  const { width, height } = useWindowDimensions();
  const isOnline = useIsOnline();
  // Offline, the player takes seconds to find out that it can't reach YouTube. The phone already knows,
  // so a trailer opened offline starts as failed.
  const [failure, setFailure] = useState<Failure | null>(isOnline ? null : 'offline');
  // The connection is back, so the trailer that waited for it plays, as on a Retry
  if (failure === 'offline' && isOnline) setFailure(null);
  // A video is wider than it is tall. In a window that is too, the bar with the close button goes beside
  // the player instead of above it, so the video gets the window's full height.
  const isLandscape = width > height;

  // The error state took the failed player's place, so this starts a new player. Offline, it tries for real.
  const retry = () => setFailure(null);
  const otherWaysForward = (
    <>
      <Button variant="outline" label="Open in YouTube" onPress={() => openLink(youtubeUrl(trailer.videoKey))} />
      <Button variant="outline" label="Back" onPress={navigation.goBack} />
    </>
  );

  return (
    <View className={`flex-1 bg-black p-safe ${isLandscape ? 'flex-row' : ''}`}>
      <StatusBar style="light" />
      {/* YouTube allows nothing drawn over its player, so the close button gets a bar of its own */}
      <View className="p-2">
        <CloseButton onPress={navigation.goBack} />
      </View>
      {failure === null && (
        <View className="flex-1">
          <TrailerPlayer
            videoKey={trailer.videoKey}
            onEnded={navigation.goBack}
            // The player can't say why it failed. Only being offline is known, from the phone itself.
            onError={() => setFailure(isOnline ? 'player' : 'offline')}
          />
        </View>
      )}
      {failure === 'offline' && (
        <OfflineState onDark message="Connect to the internet to watch this trailer." onRetry={retry}>
          {otherWaysForward}
        </OfflineState>
      )}
      {failure === 'player' && (
        <ErrorState
          onDark
          // A trailer its owner keeps to YouTube and a trailer YouTube no longer has report the same error
          title="This trailer can't play here"
          message="Try again, or watch it in YouTube."
          onRetry={retry}
        >
          {otherWaysForward}
        </ErrorState>
      )}
    </View>
  );
}
