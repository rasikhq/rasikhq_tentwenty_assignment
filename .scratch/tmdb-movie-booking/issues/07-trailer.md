# 07: Trailer

**What to build:** From a movie's detail, Watch Trailer opens a fullscreen screen that plays the trailer on its own, returns to the detail by itself when the trailer ends, and can be left at any time. If the trailer can't play in the app, the user gets a clear way forward.

**Blocked by:** 05 (Movie detail), 06 (Trailer prototype)

**Status:** resolved

- [x] Trailer rule: the official YouTube video of type "Trailer", else the official YouTube "Teaser", else the movie has no trailer. Watch Trailer shows only when the movie has a trailer.
- [x] The Trailer screen is a fullscreen modal that follows device rotation and autoplays on open.
- [x] When the trailer ends, the app returns to the detail with no user action.
- [x] A close button and Android back leave at any time.
- [x] An error (including an embed that isn't allowed, or being offline) shows an error state with Retry, Open in YouTube and Back.
- [x] Playback sits behind our own trailer player component, built as ticket 06 recommends: it takes a video key and reports ended and error events.
- [x] Unit tests for the trailer rule.
- [x] Behaviour tests with a fake trailer player: Watch Trailer is hidden without a trailer; the ended event returns to the detail; an error shows Retry, Open in YouTube and Back.

## Decisions made while building

- The trailer rule is `pickTrailer()` in `src/api/trailer.ts`. It lives in the API module because it reads TMDb's video fields (`site`, `type`, `official`), which only `src/api` may know. The mapper calls it, so a movie detail carries `trailer: Trailer | null` and nothing else about videos. Of several official YouTube Trailers it takes the first as TMDb lists them. On the two movies checked against the real API, TMDb listed videos newest first.
- `Trailer` is `{ videoKey }`. The `Trailer` route takes `{ trailer }`, as `MovieDetail` takes `{ movie }`.
- A detail saved before this ticket has no `trailer` field, so it shows no Watch Trailer until it refetches (it counts as stale after 24 hours). The app has not shipped, so the app version, which is the persister's cache buster, stays at 1.0.0.
- Watch Trailer is the Figma's outlined button, under the release line on the movie's image. `Button` gains an `outline` variant with white text, for dark surfaces only.
- The trailer screen is black, with the close button in a bar of its own, because YouTube allows nothing drawn over its player. In a window wider than it is tall the bar goes beside the player, so the video gets the full height. This compares the window's width with its height rather than using the wide breakpoint: on a tablet in portrait the video is limited by width, and a side bar would cost it some.
- The screen is a `fullScreenModal` in the native stack. It follows rotation because the app's orientation is `default` and no screen locks it.
- The trailer player (`src/components/TrailerPlayer.tsx`) follows ticket 06's recommendation with three changes:
  - The "never became ready" timer runs inside the page, not in React. The page clears it on ready and reports at most one error, which removes the prototype's false timeout after a Fast Refresh. The component also guards against a second error from the WebView itself.
  - The video key is escaped before it goes into the page's script, since it comes from TMDb.
  - The player's own links to YouTube (the logo, the title, "More videos") open through `Linking`, and the player stays. On Android, `react-native-webview` doesn't set `isTopFrame` on the request, so the prototype's check let those links load YouTube's site inside our WebView. Android only asks about the page itself, so a request counts as a frame only when `isTopFrame` is `false`.
- Retry needs no React `key`: the error state takes the player's place, so Retry mounts a new player.
- The player can't tell a blocked embed from a missing video (ticket 06), so that failure has one message: "This trailer can't play here". Only being offline is known, from the phone. The screen records why the trailer isn't playing when it fails (`'offline'` or `'player'`), and the message follows that reason, not the connection at the moment of rendering.
- Offline uses the same `OfflineState` as the list and the detail, on a dark screen: "You're offline", and a Retry that also asks NetInfo again. A trailer opened while offline shows it at once, because on Android the player took about 5 seconds to find out by itself. When the connection returns, the trailer that waited for it plays with no tap, as the detail's offline state recovers.
- `ErrorState` and `OfflineState` gain `onDark` (white text) and `children` (more buttons after Retry). The buttons sit in a row that wraps, so all three fit a phone in landscape.
- Tests: `src/test/setup.ts` replaces the trailer player with the fake in `src/test/trailerPlayer.tsx` for every test, so the WebView is never imported. The fake shows its video key, and `endTrailer()` and `failTrailer()` fire its events. "Open in YouTube" is asserted at `Linking.openURL`, React Native's own Jest mock, which is where leaving for another app becomes visible. `CLAUDE.md` now names that seam. `tmdbVideo()` builds a video, and `tmdbMovieDetail()` has no videos by default.
- Links leave the app through `openLink()` in `src/lib/openLink.ts`, from Open in YouTube and from the player's own links. A phone with nothing to open the link does nothing, and no rejection goes unhandled.
- Review (Standards and Spec sub-agents, about 232k tokens) found that the error message followed the live connection: a trailer opened offline changed to "This trailer can't play here" when the connection returned, though nothing had been tried, and a blocked trailer said "connect to the internet" when the phone later went offline. The two bullets above on the failure reason and `OfflineState` are the fix, with a test for each case. Review also led to `openLink()`, a fixed "Close" label on the close button (as `BackButton` has "Back"), and clearer names in the player and the tests.
- Kept after review, on the user's decision, which followed the agent's recommendation both times:
  - The trailer screen's layout compares the window's width with its height. The spec says "Layout decisions use width breakpoints from the window size, not an orientation flag". This is still read from the window size, so tablets and split view behave, but it is not the wide breakpoint.
  - The app version, and so the cache buster, stays at 1.0.0 although the saved detail's shape changed, because the app has not shipped.
- Known limit, from review: on Android `react-native-webview` waits 250 ms for the answer about a link and then lets it load. If the JavaScript thread is busy for longer, a player link loads YouTube's site inside the player instead of opening YouTube.
- Not covered by tests, because Jest has no layout or native stack: the landscape layout, Android back and rotation. They were checked on the devices.
- Verified: `npm run check` passes (typecheck, lint with no warnings, 83 tests). On the iPhone 17 Pro simulator (iOS 26.5): Watch Trailer opens the trailer, which autoplays with the close button above it; seeking to the end returns to the detail with no tap; the player's YouTube logo opens YouTube in Safari and the player is still there on return; a video whose owner blocks embedding (Runner, from ticket 06) shows the error state, and Open in YouTube opens Safari. On the Pixel 9 Pro emulator (API 35): autoplay; rotation mid-playback with the close button beside the player; Android back; offline shows the offline error state, and Retry plays once the connection is back; the player's YouTube logo opens the YouTube app; the blocked video shows the error state. Not checked: iOS in landscape (the simulator can't be rotated from the command line), offline on iOS, the iOS 18.5 simulator, and the 12-second timer. The review's fixes were checked by tests only, not seen on a device.

## Comments

**2026-09-30, context from ticket 06**

The trailer prototype's findings and recommended player interface are in ticket 06's Comments. Its code, including a working player to start from (`src/prototype/OwnTrailerPlayer.tsx`), is on the local `prototype/trailer` branch at commit `9045c6b`, which is not merged.
