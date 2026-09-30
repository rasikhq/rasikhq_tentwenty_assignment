// PROTOTYPE (branch prototype/trailer, ticket 06). Throwaway: candidate B, our own thin wrapper
// around react-native-webview running the official YouTube IFrame Player API.
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

/** YouTube wants the app id as an HTTPS referrer: reversed bundle id (YouTube's embed requirements). */
export const APP_REFERRER = 'https://com.rasikhqadeer.tmdbmovies';

export type OwnPlayerEvent =
  | { type: 'ready' }
  | { type: 'state'; name: string }
  | { type: 'ended' }
  | { type: 'error'; reason: string };

type Props = {
  videoKey: string;
  onEvent: (event: OwnPlayerEvent) => void;
  /** Seconds to wait for the player to become ready before reporting an error. */
  readyTimeoutSeconds?: number;
  muted?: boolean;
  /** Leaves out the baseUrl, so the page loads as about:blank with no referrer: checks YouTube's error 153. */
  noReferrer?: boolean;
};

const STATE_NAMES: Record<string, string> = {
  '-1': 'unstarted',
  '0': 'ended',
  '1': 'playing',
  '2': 'paused',
  '3': 'buffering',
  '5': 'cued',
};

function playerHtml(videoKey: string, muted: boolean) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}#player{position:absolute;top:0;left:0;width:100%;height:100%}</style>
</head>
<body>
<div id="player"></div>
<script>
function post(type, data) { window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data })); }
var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
tag.onerror = function () { post('scriptError'); };
document.head.appendChild(tag);
function onYouTubeIframeAPIReady() {
  new YT.Player('player', {
    width: '100%',
    height: '100%',
    videoId: ${JSON.stringify(videoKey)},
    playerVars: { autoplay: 1, mute: ${muted ? 1 : 0}, playsinline: 1, rel: 0, fs: 0, modestbranding: 1, controls: 1 },
    events: {
      onReady: function () { post('ready'); },
      onStateChange: function (e) { post('state', e.data); },
      onError: function (e) { post('error', e.data); }
    }
  });
}
</script>
</body>
</html>`;
}

/** The candidate B player: a video key in; ready, state, ended and error events out. */
export function OwnTrailerPlayer({
  videoKey,
  onEvent,
  readyTimeoutSeconds = 12,
  muted = false,
  noReferrer = false,
}: Props) {
  const html = useMemo(() => playerHtml(videoKey, muted), [videoKey, muted]);
  const ready = useRef(false);

  // The IFrame API script that fails to load (offline) reports nothing else, so a timeout catches a player that never starts
  useEffect(() => {
    ready.current = false;
    const timer = setTimeout(() => {
      if (!ready.current) onEvent({ type: 'error', reason: 'timeout' });
    }, readyTimeoutSeconds * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoKey]);

  const onMessage = (event: WebViewMessageEvent) => {
    const message = JSON.parse(event.nativeEvent.data) as { type: string; data?: number };
    switch (message.type) {
      case 'ready':
        ready.current = true;
        onEvent({ type: 'ready' });
        break;
      case 'state': {
        const name = STATE_NAMES[String(message.data)] ?? `state ${String(message.data)}`;
        onEvent({ type: 'state', name });
        if (message.data === 0) onEvent({ type: 'ended' });
        break;
      }
      case 'error':
        onEvent({ type: 'error', reason: `code ${String(message.data)}` });
        break;
      case 'scriptError':
        onEvent({ type: 'error', reason: 'iframe_api script failed to load' });
        break;
    }
  };

  return (
    <View style={styles.fill}>
      <WebView
        style={styles.webView}
        source={noReferrer ? { html } : { html, baseUrl: APP_REFERRER }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        bounces={false}
        onMessage={onMessage}
        onError={(e) => onEvent({ type: 'error', reason: `webview error: ${e.nativeEvent.description}` })}
        onHttpError={(e) => onEvent({ type: 'error', reason: `http ${e.nativeEvent.statusCode}` })}
        onShouldStartLoadWithRequest={(request) => {
          // The YouTube logo and "Watch on YouTube" links navigate the top frame: keep them inside the app's control
          if (!request.isTopFrame) return true;
          const allowed = request.url === 'about:blank' || request.url.startsWith(APP_REFERRER);
          if (!allowed) onEvent({ type: 'state', name: `blocked navigation to ${request.url.slice(0, 60)}` });
          return allowed;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  webView: { flex: 1, backgroundColor: '#000' },
});
