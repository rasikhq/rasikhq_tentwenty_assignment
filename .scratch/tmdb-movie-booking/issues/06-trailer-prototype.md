# 06: Trailer prototype

**What to build:** A throwaway prototype that answers one question before the trailer ticket: which trailer player implementation meets the brief on both platforms, `react-native-youtube-iframe` or a thin wrapper of our own around `react-native-webview` running the official YouTube IFrame Player API.

**Blocked by:** 01 (App shell)

**Status:** resolved

- [x] Both candidates are tried in a development build on the iOS simulator and the Android emulator.
- [x] For each candidate: does it autoplay on open, report when the video ends, report errors (including videos that don't allow embedding), survive rotation, and meet YouTube's embed requirements?
- [x] Maintenance risk is weighed: `react-native-youtube-iframe` has had no release in about 15 months, has an open play/pause issue, and loads its default player page from the maintainer's GitHub Pages.
- [x] A short findings note, appended to this ticket's Comments, recommends one implementation and the trailer player component's interface (video key in; ended and error events out).
- [x] The prototype code stays on a `prototype/trailer` branch and is not merged to main.

## Comments

**2026-09-30, prototype findings**

The prototype is commit `9045c6b` on the local `prototype/trailer` branch, which is not merged. `npm run prototype:trailer` starts Metro with a harness screen as the first route. The screen runs one candidate at a time against a chosen video and logs every player event with the seconds since Open, on screen and in the Metro log.

- **Setup:** development builds on the iPhone 17 Pro simulator (iOS 26.5) and the Pixel 9 Pro emulator (API 35).
- **Candidate A:** `react-native-youtube-iframe` 2.4.1, tried three ways: its default player page; `useLocalHTML` with `baseUrlOverride` set to our app id; and that plus `forceAndroidAutoplay`.
- **Candidate B:** our own component, about 130 lines. It gives `react-native-webview` 13.16.0 (the Expo SDK 55 pin) an inline HTML page that loads the official IFrame Player API, with `baseUrl` `https://com.rasikhqadeer.tmdbmovies`.
- **Videos:** a 19-second embeddable video (`jNQXAC9IVRw`), the "It Ends" trailer (`mQj2Hm7TXLQ`), "Runner"'s official trailer (`B6Z9MM1LhEA`), whose owner blocks embedding, and a made-up key. Runner came from checking the official trailers of 125 TMDb movies against YouTube's oEmbed endpoint; it was the only one blocked.

| | A: `react-native-youtube-iframe` | B: our own WebView player |
| --- | --- | --- |
| Autoplay on open, iOS | Default page: no, the player waits for a tap. Local HTML: yes, with sound. | Yes, with sound: playing about 1 s after ready |
| Autoplay on open, Android | No in all three setups, including `forceAndroidAutoplay` | Yes, with sound: playing about 4 to 7 s after ready |
| Ended event | Yes (Android after a manual play, iOS with local HTML) | Yes, on both platforms |
| Embed blocked (Runner) | `embed_not_allowed` on both | Error code 150 on both |
| Offline (checked on Android) | No event: a black player that stays black | Error about 1 s after Open, when the IFrame API script fails to load |
| Rotation, mid-playback | Keeps playing (Android, local HTML) | Keeps playing, no reload, on both platforms |
| YouTube referrer | Default page: the maintainer's GitHub Pages URL. Local HTML: our app id. | Our app id |

Other findings:

- **The referrer is required.** B without a `baseUrl` (an `about:blank` page with no referrer) fails on both platforms with error 153, "missing HTTP Referer". YouTube's Required Minimum Functionality asks apps to identify themselves in the Referer as an HTTPS URL of the app id. A's default page sends the maintainer's GitHub Pages URL instead, so A must use local HTML to comply. That fixes the referrer, not Android autoplay.
- **A's `play` prop does nothing on Android.** This matches the open issues about play and pause since 2.4.0 (#376, #377, #386, #393). The last release, 2.4.1, was on 2025-07-01. A also types its component as `React.VFC`, which `@types/react` 19 removed, so under this project's strict TypeScript it is `any` until cast.
- **The error codes can't tell a blocked video from a missing one:** the made-up key also returned 150, not 100. The trailer screen should treat every error the same: one error state with Retry, Open in YouTube and Back.
- **Offline needs our own detection.** The IFrame API reports nothing when its script can't load. B reports an error from the script tag's `onerror`, with a 12-second "never became ready" timer as backup. In the prototype both fired once each. The real component should report one error and stop the timer on ready. A Fast Refresh restarted the timer mid-playback and fired a false timeout, because the prototype checks a ref instead of clearing the timer.
- **Not checked:** offline on iOS, because the simulator shares the Mac's network (the offline path is the same JavaScript on both platforms). Also not checked: the "Watch on YouTube" and logo links. B blocks top-frame navigation away from its page; ticket 07 should open those links in YouTube through `Linking`.
- **Embed requirements for ticket 07:** the player must be at least 200 by 200 pt, visible before it autoplays, and have nothing drawn on top of it. The close button must sit outside the WebView, for example in a bar above it, not floating over the video.
- **Jest:** `react-native-webview` ships no Jest mock, and importing it under Jest throws at load (`TurboModuleRegistry.getEnforcing`). The prototype branch stubs it in `src/test/setup.ts`. Ticket 07's tests replace the trailer player component with a fake, so the WebView should never be imported in tests.

**Recommendation: B, our own WebView player.** The user approved it after reviewing these findings, and ADR-0005 records the decision. It is the only candidate that autoplays on both platforms. It reports offline, and it sends our app id as the referrer by design. It adds only `react-native-webview`, which Expo pins and maintains. The cost is about 100 lines of our own, following the same official IFrame API that A wraps.

The rejected alternative, `react-native-youtube-iframe`, fails the brief's autoplay on Android in every setup and stays silent offline. Its default page breaks YouTube's referrer rule and depends on the maintainer's GitHub Pages at runtime, and it hasn't had a release in 15 months.

Recommended interface for the trailer player component:

```ts
type TrailerPlayerProps = {
  /** The YouTube video key from the movie's trailer. */
  videoKey: string;
  /** The video played to the end. */
  onEnded: () => void;
  /** The video can't play here: embedding not allowed, not found, offline, or the player never became ready. Reported once. */
  onError: () => void;
};
```

Retry remounts the player with a new React `key`. Inside the component: `playerVars` `autoplay: 1`, `playsinline: 1`, `rel: 0`, `fs: 0`; the player fills the WebView (100% by 100%); the WebView props `mediaPlaybackRequiresUserAction={false}` and `allowsInlineMediaPlayback`; and `baseUrl` from the app id.
