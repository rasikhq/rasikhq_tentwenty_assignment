# 13: Release: README, APK and demo

**What to build:** A submittable release: a README a reviewer can follow, an installable Android APK, and a demo folder with the screen recording.

**Blocked by:** 07 (Trailer), 09 (Search results screen), 11 (Seat map zoom). If ticket 12 or a stretch ticket lands afterwards, rebuild the APK and refresh the README.

**Status:** resolved

- [x] The README covers:
  - what the app does and how to set it up (Node, install, `.env` with `EXPO_PUBLIC_TMDB_TOKEN`, running on iOS and Android);
  - that the token is read from an environment variable at build time and ships inside the bundle, and that a production app would call TMDb through its own backend;
  - the libraries chosen and why;
  - scope decisions (Figma extras left out, genre browse, stretch items);
  - the iOS floor of 15.1, and the simulators and emulator actually tested;
  - trade-offs, and what breaks first at 10× the data;
  - pointers to CLAUDE.md, the planning notes, the ADRs and the steering log.
- [x] A release APK is built locally from the generated Android project, signed with the debug keystore, installed and smoke-tested on the emulator. No keystore is committed.
- [x] The APK is attached to a GitHub release and linked from the demo folder (or committed there if small enough).
- [x] The demo folder holds the screen recording, recorded by the developer.
- [x] If time allows, an iOS simulator build is zipped into the demo folder.
- [x] `npm run check` and CI are green on the release commit.

## Decisions made while building

- The README is the full version: what the app does, the demo builds, setup and the token, run, check, release builds, libraries and why, scope decisions, platforms and what was tested, trade-offs, what breaks first at 10× the data, the trail of how it was built, and the layout of the code. Its facts come from the spec, the ADRs, the steering log and the tickets' notes. The user edited two lines while it was written (the runtimes not tested, and the debug keystore line), and those stay as written.
- The APK: `./gradlew assembleRelease` in the generated `android/` project, with JDK 17. 17 minutes 53 seconds, with the iOS build running beside it. `android/` was not generated again: it is newer than `app.json`, and Gradle links native modules itself.
  - 85,465,318 bytes, because it holds the native libraries of all four ABIs. Kept that way, so it installs on phones and on emulators on Intel and Apple Silicon machines. The rejected option was an APK for `arm64-v8a` and `x86_64` only: smaller, and still too large to commit.
  - Checked with `apksigner` and `aapt2`: signed by "CN=Android Debug", version 1.0.0 (code 1), target API 36. The token from `.env` is in the bundle (one match, not printed).
  - Too large to commit (GitHub warns from 50 MB and rejects from 100 MB), so it goes on a GitHub release. `demo/README.md` links to the release `v1.0.0` with a relative link, because the repository has no remote and no name yet. The file waits at `demo/tmdb-movies-1.0.0.apk` for the release.
- The iOS simulator build: `xcodebuild` with the Release configuration and the `iphonesimulator` SDK. `TMDbMovies.app` is 65 MB, for arm64 and x86_64, and 19.6 MB zipped with `ditto`. The agent first committed it as `demo/tmdb-movies-1.0.0-ios-simulator.zip`, as this ticket says.
- Decided by the user after reading the first version: neither build is committed, and both go on the GitHub release only (see the steering log). The zip is out of the commit, `demo/*.apk` and `demo/*.zip` are gitignored, and both files wait in `demo/` for the release. The demo folder holds its README, and the screen recording once it is recorded.
- `demo/README.md` says where the builds are, how to install both, the APK's checksum, and what was checked with them. The user added a note there: the token inside the builds is revoked a few days after the release.
- Smoke test, each build installed after removing the development build, against TMDb's real data:
  - APK on the Pixel 9 Pro emulator (API 35): Movie list; Movie detail; the trailer autoplays; the seat map with two seats selected, their chips, a $200 total, a zoom step and the summary; the genre grid; Top Results for "Dune"; Results with "1111 Results Found", in two columns in landscape; in airplane mode after a restart, the saved movies under the offline banner.
  - iOS build on the iPhone 16 simulator (iOS 18.5): Movie list, Movie detail, and the trailer autoplays. This is the first run on iOS 18.5. The iPhone 16 booted where the iPhone 16 Pro had failed in ticket 01.
  - iOS build on the iPhone 17 Pro simulator (iOS 26.5): Movie list.
  - Not checked on iOS 18.5: the seat map and Search. A second tap from the agent's tool fired at the first tap's place, as in tickets 08 to 12.
- Found in the smoke test: the first trailer opened after the emulator's cold boot showed "This trailer can't play here" about 12 seconds after opening. The WebView's first start took longer than the player's `READY_TIMEOUT_MS` (12 seconds). Retry played the trailer, and after a relaunch the trailer played within 10 seconds. The machine was also under load from the builds. Nothing was changed. The README's trade-offs and `demo/README.md` say so.
- `npm run check` passes (typecheck, lint with no warnings, 194 tests). No code changed in this ticket.
- The development builds on the emulator and on both simulators are replaced by the release builds. `npm run android` and `npm run ios` install the development builds again.
- The screen recording is `demo/demo.mp4`, recorded by the user with OBS: 3 minutes 13 seconds, 18.6 MB, H.264 at 1800 x 1168 and 60 frames a second, with a silent audio track (the devices were muted). It shows the release builds side by side, with no development-tools bubble on either: the APK on the Pixel 9 Pro emulator in portrait, and the iOS build on the iPhone 16 simulator (iOS 18.5) in landscape. Seen in its frames: Movie list, Movie detail, the trailer playing on both, the seat map with a selection, its chips and the summary, the genre grid (four columns on iOS), a genre's Results, and Top Results for "toy story". So the seat map and Search are now seen on iOS 18.5, and in landscape. It is committed: the demos live in `demo/`, and only the two builds go on the release. Both READMEs point to it.

## Published (2026-09-30)

The user reviewed the README, the demo folder and the recording, named the repository and said to go.

- Before the push, every commit on both branches was searched: the token from `.env` is in none of them, the only env file ever committed is `.env.example`, and no keystore, APK or zip is in the history.
- The repository is public at https://github.com/rasikhq/rasikhq_tentwenty_assignment, with `main` and `prototype/trailer` pushed.
- The release `v1.0.0` is on the commit `e07fa2a` and holds `tmdb-movies-1.0.0.apk` and `tmdb-movies-1.0.0-ios-simulator.zip`. GitHub's SHA-256 of each matches the local file. The ticket asked for the iOS build in the demo folder, and the user moved it to the release (see the steering log).
- CI is green on the release commit: the Check workflow passed for `main`, for the tag `v1.0.0` and for `prototype/trailer`. These were the workflow's first runs on GitHub.
- The release link in `demo/README.md` was checked on GitHub's pages for the demo folder and for the file. It is now the full URL, so it also works outside GitHub, and the README's Demo section links to the release too.
- Still the user's: the TMDb token inside the builds is revoked a few days after the release, as `demo/README.md` says, and the short decision note is written by the user.
