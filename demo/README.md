# Demo

Release builds of version 1.0.0, built on 2026-09-30 from the source at commit `e5dd502`. They need no Metro and no `.env`: the JavaScript bundle and the TMDb token are inside them (see "The token" in the [README](../README.md)).

> **Important Note**: The TMDb token bundled in the release builds will stop working roughly 3-5 days after the release date, for security.

# Release Builds
Builds are available in the GitHub release [v1.0.0](../../../releases/tag/v1.0.0).

## Android APK

APK holds the native libraries for all four ABIs (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`), so it installs on phones and on emulators on both Apple Silicon and Intel machines.

```bash
adb install tmdb-movies-1.0.0.apk
```

Or copy the file to a phone, open it, and allow the install from an unknown source.

- Android 7.0 (API 24) and later, target API 36.
- Signed with the debug keystore, so it installs for review and can't go to a store.
- SHA-256: `97a7b6d94a6df459749456e4d7042e07da22d6e86b22e3c81202c2bef5b65429`

## iOS simulator build

`tmdb-movies-1.0.0-ios-simulator.zip` holds `TMDbMovies.app`, a Release build for the simulator on Apple Silicon and Intel Macs, iOS 15.1 and later. A simulator build can't be installed on a real iPhone.

```bash
unzip tmdb-movies-1.0.0-ios-simulator.zip
xcrun simctl install booted TMDbMovies.app
xcrun simctl launch booted com.rasikhqadeer.tmdbmovies
```

Or drag `TMDbMovies.app` onto a running simulator.

## What was checked with these builds

Each was installed fresh (the development build removed first) and run against TMDb's real data.

- **APK, Pixel 9 Pro emulator (Android 15, API 35):** Movie list loads; a card opens Movie detail; Watch Trailer plays by itself; Get Tickets opens the seat map, two seats select with their chips and a $200 total, + zooms, and Proceed to pay shows the summary; Search shows the genre grid, then Top Results for "Dune"; the search key opens Results ("1111 Results Found"), in two columns in landscape; in airplane mode, after a restart, Movie list shows the saved movies under the offline banner.
- **iOS build, iPhone 16 simulator (iOS 18.5):** Movie list loads; a card opens Movie detail; Watch Trailer plays by itself.
- **iOS build, iPhone 17 Pro simulator (iOS 26.5):** Movie list loads.

One thing to know: on the emulator, the first trailer opened after a cold boot showed "This trailer can't play here". The WebView took longer to start than the 12 seconds the player waits. Retry played it, and so did the next launch.
