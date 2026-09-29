# 06: Trailer prototype

**What to build:** A throwaway prototype that answers one question before the trailer ticket: which trailer player implementation meets the brief on both platforms, `react-native-youtube-iframe` or a thin wrapper of our own around `react-native-webview` running the official YouTube IFrame Player API.

**Blocked by:** 01 (App shell)

**Status:** ready-for-agent

- [ ] Both candidates are tried in a development build on the iOS simulator and the Android emulator.
- [ ] For each candidate: does it autoplay on open, report when the video ends, report errors (including videos that don't allow embedding), survive rotation, and meet YouTube's embed requirements?
- [ ] Maintenance risk is weighed: `react-native-youtube-iframe` has had no release in about 15 months, has an open play/pause issue, and loads its default player page from the maintainer's GitHub Pages.
- [ ] A short findings note, appended to this ticket's Comments, recommends one implementation and the trailer player component's interface (video key in; ended and error events out).
- [ ] The prototype code stays on a `prototype/trailer` branch and is not merged to main.
