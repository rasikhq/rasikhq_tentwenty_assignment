// PROTOTYPE (branch prototype/trailer, ticket 06). Throwaway harness that runs both trailer player
// candidates side by side in one screen and logs every event with the time since Open.
// Run: `npm run prototype:trailer`, then open a development build that includes react-native-webview.
// Events also go to the Metro log as `[TRAILER-PROTO] <platform> ...`.
import { useCallback, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubeIframeUntyped, { type YoutubeIframeProps } from 'react-native-youtube-iframe';

import { APP_REFERRER, OwnTrailerPlayer, type OwnPlayerEvent } from './OwnTrailerPlayer';

// FINDING: the library types its component as React.VFC, which @types/react 19 removed, so it types as any
const YoutubeIframe = YoutubeIframeUntyped as unknown as (props: YoutubeIframeProps) => React.ReactElement;

const CANDIDATES = {
  'A: youtube-iframe (default page)': 'A',
  'A2: youtube-iframe (local html + app referrer)': 'A2',
  'A3: A2 + forceAndroidAutoplay': 'A3',
  'B: own webview wrapper': 'B',
  'B2: own wrapper, muted autoplay': 'B2',
  'B3: own wrapper, no referrer': 'B3',
} as const;
type Candidate = (typeof CANDIDATES)[keyof typeof CANDIDATES];

const VIDEOS = {
  'short (19s) embeddable': 'jNQXAC9IVRw',
  'real trailer (It Ends)': 'mQj2Hm7TXLQ',
  'embed blocked (Runner)': 'B6Z9MM1LhEA',
  'not found': 'AAAAAAAAAAA',
};

// The env var is declared here because process.env values are `any` otherwise
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_TRAILER_PROTOTYPE?: string;
    }
  }
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function TrailerPrototypeScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const landscape = width > height;
  const [candidate, setCandidate] = useState<Candidate>('B');
  const [videoKey, setVideoKey] = useState(VIDEOS['short (19s) embeddable']);
  // What OPEN pinned: picking a chip afterwards must not reload the running player
  const [session, setSession] = useState<{ n: number; candidate: Candidate; videoKey: string } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const openedAt = useRef(0);

  const write = useCallback((line: string) => {
    const t = ((Date.now() - openedAt.current) / 1000).toFixed(1);
    const entry = `${t}s ${line}`;
    console.log(`[TRAILER-PROTO] ${Platform.OS} ${entry}`);
    setLog((previous) => [entry, ...previous].slice(0, 40));
  }, []);

  const open = () => {
    openedAt.current = Date.now();
    setLog([]);
    setSession((s) => ({ n: (s?.n ?? 0) + 1, candidate, videoKey }));
    console.log(`[TRAILER-PROTO] ${Platform.OS} OPEN ${candidate} ${videoKey}`);
  };

  const onOwnEvent = (event: OwnPlayerEvent) => {
    if (event.type === 'ready') write('ready');
    else if (event.type === 'state') write(`state: ${event.name}`);
    else if (event.type === 'ended') write('*** ENDED event -> would navigate back');
    else write(`*** ERROR event: ${event.reason}`);
  };

  const playerWidth = landscape ? Math.round(width * 0.6) : width;
  const playerHeight = landscape ? height : Math.round((width * 9) / 16);

  const player =
    session === null ? (
      <View style={styles.blank}>
        <Text style={styles.chipText}>Pick a candidate and a video, then Open</Text>
      </View>
    ) : session.candidate.startsWith('B') ? (
      <OwnTrailerPlayer
        key={session.n}
        videoKey={session.videoKey}
        onEvent={onOwnEvent}
        muted={session.candidate === 'B2'}
        noReferrer={session.candidate === 'B3'}
      />
    ) : (
      <YoutubeIframe
        key={session.n}
        height={playerHeight}
        width={playerWidth}
        videoId={session.videoKey}
        play
        forceAndroidAutoplay={session.candidate === 'A3'}
        useLocalHTML={session.candidate !== 'A'}
        baseUrlOverride={session.candidate !== 'A' ? APP_REFERRER : undefined}
        initialPlayerParams={{ preventFullScreen: true, rel: false }}
        onReady={() => write('ready')}
        onChangeState={(s) => {
          write(`state: ${s}`);
          if (String(s) === 'ended') write('*** ENDED event -> would navigate back');
        }}
        onError={(e) => write(`*** ERROR event: ${String(e)}`)}
        onFullScreenChange={(f) => write(`fullscreen ${String(f)}`)}
      />
    );

  const controls = (
    <ScrollView
      style={landscape ? styles.side : styles.below}
      contentContainerStyle={{ padding: 10, paddingBottom: insets.bottom + 10 }}
    >
      <View style={styles.row}>
        {Object.entries(CANDIDATES).map(([label, value]) => (
          <Chip key={value} label={label} on={candidate === value} onPress={() => setCandidate(value)} />
        ))}
      </View>
      <View style={styles.row}>
        {Object.entries(VIDEOS).map(([label, key]) => (
          <Chip key={key} label={label} on={videoKey === key} onPress={() => setVideoKey(key)} />
        ))}
      </View>
      <View style={styles.row}>
        <Chip label="OPEN" on onPress={open} />
        <Chip label="CLEAR LOG" on={false} onPress={() => setLog([])} />
      </View>
      {log.map((line, index) => (
        <Text key={`${index}-${line}`} style={[styles.log, line.includes('***') && styles.logHot]}>
          {line}
        </Text>
      ))}
    </ScrollView>
  );

  return (
    <View
      style={[
        styles.root,
        landscape && styles.rootLandscape,
        { paddingTop: landscape ? 0 : insets.top, paddingLeft: insets.left, paddingRight: insets.right },
      ]}
    >
      <View style={{ width: playerWidth - (landscape ? insets.left : 0), height: playerHeight, backgroundColor: '#000' }}>
        {player}
      </View>
      {controls}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111' },
  rootLandscape: { flexDirection: 'row' },
  blank: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  below: { flex: 1 },
  side: { flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: '#666', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  chipOn: { backgroundColor: '#3aa', borderColor: '#3aa' },
  chipText: { color: '#ccc', fontSize: 12 },
  chipTextOn: { color: '#000', fontWeight: '600' },
  log: { color: '#9f9', fontFamily: 'Courier', fontSize: 11 },
  logHot: { color: '#f96' },
});
