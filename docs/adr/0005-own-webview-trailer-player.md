# Our own trailer player over react-native-webview

The trailer must autoplay on open, return to the detail when it ends, and show an error state when it can't play. We play it with our own trailer player component. That component is a WebView from `react-native-webview` running YouTube's official IFrame Player API from an inline HTML page. The page's `baseUrl` is the app id as an HTTPS URL (`https://com.rasikhqadeer.tmdbmovies`), so YouTube sees the app in the Referer. The component takes a video key and reports ended and error events. The trailer prototype (ticket 06) tried both options on the iOS simulator and the Android emulator. Our own player was the only one that autoplayed on both platforms and reported being offline.

## Considered Options

- **`react-native-youtube-iframe` 2.4.1**: a wrapper around the same IFrame API and WebView. On Android it didn't autoplay in any setup, including `forceAndroidAutoplay`; this matches its open play/pause issues since 2.4.0. Offline, it showed a black player and reported nothing. By default it loads its player page from the maintainer's GitHub Pages, so YouTube sees that site as the Referer instead of the app. It hasn't had a release since July 2025. Its component is typed as `React.VFC`, which React 19's types removed.

## Consequences

- We own about 100 lines of player code, and we follow changes to the IFrame API ourselves. The library wraps the same API, so it would face those changes too.
- The Referer is required: without a `baseUrl`, YouTube refuses to play with error 153 on both platforms.
- The IFrame API reports nothing when its script can't load, so the component detects that itself: from the script's load error, and from a timer for a player that never becomes ready. It reports one error.
- YouTube's embed rules shape the trailer screen: nothing may be drawn over the player, so the close button sits outside the WebView.
- `react-native-webview` ships no Jest mock, so tests replace the trailer player component with a fake and never import the WebView.

Sources: ticket 06's findings in `.scratch/tmdb-movie-booking/issues/06-trailer-prototype.md`, https://developers.google.com/youtube/iframe_api_reference, https://developers.google.com/youtube/terms/required-minimum-functionality
