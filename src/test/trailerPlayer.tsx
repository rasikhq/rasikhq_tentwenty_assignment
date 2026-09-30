import { act } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import type { TrailerPlayerProps } from '../components/TrailerPlayer';

let playing: TrailerPlayerProps | null = null;

/**
 * Stands in for the trailer player in every test: the real one is a WebView running YouTube's player,
 * which Jest can't run. It shows the video key it plays, and the test decides when the trailer ends or
 * can't play.
 */
export function TrailerPlayer(props: TrailerPlayerProps) {
  useEffect(() => {
    playing = props;
    return () => {
      playing = null;
    };
  }, [props]);

  return (
    <View accessibilityLabel="Trailer player">
      <Text>{props.videoKey}</Text>
    </View>
  );
}

function player() {
  if (!playing) throw new Error('No trailer is playing');
  return playing;
}

/** The trailer plays to its end. */
export async function endTrailer() {
  await act(() => player().onEnded());
}

/** The trailer can't play in the app: its owner doesn't allow embedding, or YouTube can't be reached. */
export async function failTrailer() {
  await act(() => player().onError());
}
