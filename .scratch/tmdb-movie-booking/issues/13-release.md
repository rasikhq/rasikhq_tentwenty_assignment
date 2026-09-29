# 13: Release: README, APK and demo

**What to build:** A submittable release: a README a reviewer can follow, an installable Android APK, and a demo folder with the screen recording.

**Blocked by:** 07 (Trailer), 09 (Search results screen), 11 (Seat map zoom). If ticket 12 or a stretch ticket lands afterwards, rebuild the APK and refresh the README.

**Status:** ready-for-agent

- [ ] The README covers:
  - what the app does and how to set it up (Node, install, `.env` with `EXPO_PUBLIC_TMDB_TOKEN`, running on iOS and Android);
  - that the token is read from an environment variable at build time and ships inside the bundle, and that a production app would call TMDb through its own backend;
  - the libraries chosen and why;
  - scope decisions (Figma extras left out, genre browse, stretch items);
  - the iOS floor of 15.1, and the simulators and emulator actually tested;
  - trade-offs, and what breaks first at 10× the data;
  - pointers to CLAUDE.md, the planning notes, the ADRs and the steering log.
- [ ] A release APK is built locally from the generated Android project, signed with the debug keystore, installed and smoke-tested on the emulator. No keystore is committed.
- [ ] The APK is attached to a GitHub release and linked from the demo folder (or committed there if small enough).
- [ ] The demo folder holds the screen recording, recorded by the developer.
- [ ] If time allows, an iOS simulator build is zipped into the demo folder.
- [ ] `npm run check` and CI are green on the release commit.
