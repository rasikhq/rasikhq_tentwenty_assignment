import { useMemo, useRef } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export type TrailerPlayerProps = {
  /** The YouTube video key from the movie's trailer. */
  videoKey: string;
  /** The video played to the end. */
  onEnded: () => void;
  /**
   * The video can't play here: embedding isn't allowed, the video wasn't found, the phone is offline, or
   * the player never became ready. Reported once.
   */
  onError: () => void;
};

// YouTube asks an app to name itself in the Referer, as an HTTPS URL of its app id (the one in app.json),
// and refuses to play without one (error 153). The WebView sends its page's base URL as the Referer.
const APP_URL = 'https://com.rasikhqadeer.tmdbmovies';

// How long the player gets to become ready before the page reports an error
const READY_TIMEOUT_MS = 12_000;

/**
 * The page the WebView shows: YouTube's IFrame Player API, playing one video on its own, filling the
 * page. It posts "ended" when the video ends and "error", once, when the video can't play.
 */
function playerPage(videoKey: string) {
  // The key comes from TMDb, and the page is a script: a "<" can't be allowed to close the script tag
  const videoId = JSON.stringify(videoKey).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}#player{position:absolute;top:0;left:0;width:100%;height:100%}</style>
</head>
<body>
<div id="player"></div>
<script>
var failed = false;
function post(message) { window.ReactNativeWebView.postMessage(message); }
function fail() {
  clearTimeout(readyTimer);
  if (failed) return;
  failed = true;
  post('error');
}
// The IFrame API reports nothing when its own script can't load, as when the phone is offline. The
// script's load error covers that, and the timer covers a player that never becomes ready.
var readyTimer = setTimeout(fail, ${READY_TIMEOUT_MS});
var api = document.createElement('script');
api.src = 'https://www.youtube.com/iframe_api';
api.onerror = fail;
document.head.appendChild(api);
function onYouTubeIframeAPIReady() {
  new YT.Player('player', {
    width: '100%',
    height: '100%',
    videoId: ${videoId},
    // fs: 0 hides YouTube's own fullscreen button: the trailer screen is already fullscreen
    playerVars: { autoplay: 1, playsinline: 1, rel: 0, fs: 0 },
    events: {
      onReady: function () { clearTimeout(readyTimer); },
      onStateChange: function (event) { if (event.data === YT.PlayerState.ENDED) post('ended'); },
      onError: fail
    }
  });
}
</script>
</body>
</html>`;
}

/**
 * Plays a YouTube video on its own, in YouTube's official embedded player inside a WebView (ADR-0005).
 * It fills the space its parent gives it. Retry is a new player: mount it again.
 */
export function TrailerPlayer({ videoKey, onEnded, onError }: TrailerPlayerProps) {
  const page = useMemo(() => playerPage(videoKey), [videoKey]);
  // The page reports one error, and the WebView can report its own
  const errorReported = useRef(false);

  const reportError = () => {
    if (errorReported.current) return;
    errorReported.current = true;
    onError();
  };

  return (
    <WebView
      // NativeWind's className only reaches React Native's own components
      style={styles.player}
      source={{ html: page, baseUrl: APP_URL }}
      // The player opens about:blank frames, which the default list of http and https origins turns away
      originWhitelist={['*']}
      // Without these two, the video waits for a tap, and iOS opens it in its own fullscreen player
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback
      // A link that asks for a new window, as the player's links to YouTube do, loads in this one
      // instead, where onShouldStartLoadWithRequest sees it
      setSupportMultipleWindows={false}
      bounces={false}
      onMessage={(event) => {
        if (event.nativeEvent.data === 'ended') onEnded();
        if (event.nativeEvent.data === 'error') reportError();
      }}
      onError={reportError}
      onShouldStartLoadWithRequest={(request) => {
        // The video loads in a frame of our page. A request to replace the page itself is one of the
        // player's links to YouTube: it opens in YouTube, and the player stays. iOS asks about every
        // frame and says which it is. Android asks only about the page, and doesn't say.
        const isFrame = request.isTopFrame === false;
        const isOurPage =
          request.url === 'about:blank' || request.url === APP_URL || request.url.startsWith(`${APP_URL}/`);
        if (isFrame || isOurPage) return true;
        if (request.url.startsWith('https://')) void Linking.openURL(request.url);
        return false;
      }}
    />
  );
}

const styles = StyleSheet.create({
  player: { flex: 1, backgroundColor: '#000' },
});
