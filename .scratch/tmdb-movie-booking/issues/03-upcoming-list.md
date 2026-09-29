# 03: Upcoming movie list

**What to build:** The app's entry point, end to end: upcoming movies from TMDb as Figma-style cards that load more as the user scrolls, with pull-to-refresh and every state designed. This is the first real path through every layer: API client, mapping, query, screen and tests.

**Blocked by:** 02 (Quality harness)

**Status:** ready-for-agent

- [ ] The API client calls TMDb with the Read Access Token as a Bearer header, passes the query's `AbortSignal` to every request, and turns failures into typed errors: token missing or invalid, not found, rate limited, offline or network failure, server error.
- [ ] Only the API module knows TMDb's JSON: upcoming results are mapped into app movie types, and screens import app types only.
- [ ] Query keys come from one central factory.
- [ ] Movie List shows upcoming movies as cards (backdrop image, title over a darkening gradient) using expo-image, with an image size chosen for the card slot rather than `original`.
- [ ] More pages load on scroll (FlashList with an infinite query); pull-to-refresh refetches.
- [ ] One column below the wide breakpoint and two above it, driven by window width.
- [ ] Loading shows skeleton cards; a failed load shows a message with Retry that recovers; an empty response shows specific empty text.
- [ ] Real TMDb responses are checked: whether pages repeat movies (if so, flattening de-duplicates by movie id), whether a region parameter is needed, and whether past release dates appear. Findings go in this ticket's Comments.
- [ ] Behaviour tests: the list renders movies served by MSW; scrolling loads the next page; an error followed by Retry shows movies; repeated movies render once if de-duplication was needed.
