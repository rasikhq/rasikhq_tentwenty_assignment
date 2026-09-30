# 07: Trailer

**What to build:** From a movie's detail, Watch Trailer opens a fullscreen screen that plays the trailer on its own, returns to the detail by itself when the trailer ends, and can be left at any time. If the trailer can't play in the app, the user gets a clear way forward.

**Blocked by:** 05 (Movie detail), 06 (Trailer prototype)

**Status:** ready-for-agent

- [ ] Trailer rule: the official YouTube video of type "Trailer", else the official YouTube "Teaser", else the movie has no trailer. Watch Trailer shows only when the movie has a trailer.
- [ ] The Trailer screen is a fullscreen modal that follows device rotation and autoplays on open.
- [ ] When the trailer ends, the app returns to the detail with no user action.
- [ ] A close button and Android back leave at any time.
- [ ] An error (including an embed that isn't allowed, or being offline) shows an error state with Retry, Open in YouTube and Back.
- [ ] Playback sits behind our own trailer player component, built as ticket 06 recommends: it takes a video key and reports ended and error events.
- [ ] Unit tests for the trailer rule.
- [ ] Behaviour tests with a fake trailer player: Watch Trailer is hidden without a trailer; the ended event returns to the detail; an error shows Retry, Open in YouTube and Back.

## Comments

**2026-09-30, context from ticket 06**

The trailer prototype's findings and recommended player interface are in ticket 06's Comments. Its code, including a working player to start from (`src/prototype/OwnTrailerPlayer.tsx`), is on the local `prototype/trailer` branch at commit `9045c6b`, which is not merged.
