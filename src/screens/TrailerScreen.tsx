import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Linking, useWindowDimensions, View } from 'react-native';

import { Button } from '../components/Button';
import { CloseButton } from '../components/CloseButton';
import { ErrorState } from '../components/ErrorState';
import { TrailerPlayer } from '../components/TrailerPlayer';
import { useIsOnline } from '../hooks/useIsOnline';
import type { RootStackParamList } from '../navigation/RootNavigator';

/** The trailer's page on YouTube, where it plays even when its owner doesn't allow it in other apps. */
function youtubeUrl(videoKey: string) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoKey)}`;
}

export function TrailerScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Trailer'>) {
  const { trailer } = route.params;
  const { width, height } = useWindowDimensions();
  const isOnline = useIsOnline();
  // Offline, the player takes seconds to find out that it can't reach YouTube. The phone already knows,
  // so a trailer opened offline starts as failed. Retry still tries for real.
  const [failed, setFailed] = useState(!isOnline);
  // A video is wider than it is tall. In a window that is too, the bar with the close button goes beside
  // the player instead of above it, so the video gets the window's full height.
  const isLandscape = width > height;

  return (
    <View className={`flex-1 bg-black p-safe ${isLandscape ? 'flex-row' : ''}`}>
      <StatusBar style="light" />
      {/* YouTube allows nothing drawn over its player, so the close button gets a bar of its own */}
      <View className="p-2">
        <CloseButton label="Close trailer" onPress={navigation.goBack} />
      </View>
      {failed ? (
        <ErrorState
          onDark
          // The player can't say why it failed: a trailer its owner keeps to YouTube and a trailer YouTube
          // no longer has report the same error. Only being offline is known, from the phone itself.
          title={isOnline ? "This trailer can't play here" : "You're offline"}
          message={isOnline ? 'Try again, or watch it in YouTube.' : 'Connect to the internet, then try again.'}
          // The error state took the failed player's place, so this starts a new player
          onRetry={() => setFailed(false)}
        >
          <Button
            variant="outline"
            label="Open in YouTube"
            // The phone opens the link in the YouTube app when it has one, and in the browser when not
            onPress={() => void Linking.openURL(youtubeUrl(trailer.videoKey))}
          />
          <Button variant="outline" label="Back" onPress={navigation.goBack} />
        </ErrorState>
      ) : (
        <View className="flex-1">
          <TrailerPlayer
            videoKey={trailer.videoKey}
            onEnded={navigation.goBack}
            onError={() => setFailed(true)}
          />
        </View>
      )}
    </View>
  );
}
