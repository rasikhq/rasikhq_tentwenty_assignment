# Expo SDK 55, to keep both Expo and iOS 15

The brief requires a current React Native release, iOS 15+, Android target API 36 and the New Architecture, and these collide: Expo SDK 56 and later require iOS 16.4. We use Expo SDK 55 (React Native 0.83), the newest SDK that still supports iOS 15.1 while targeting API 36 on the New Architecture. The cost is that React Native 0.83 sits outside React Native's own support window; the next SDK upgrade is the planned point to drop iOS 15, as a product decision made with real user numbers.

## Considered Options

- **Bare React Native CLI 0.87**: meets every requirement literally, but loses Expo, including `expo-image`'s disk cache that offline posters rely on. Adding Expo modules later doesn't escape the floor either: from SDK 56 on they require iOS 16.4.
- **Expo SDK 57 (React Native 0.86)**: current, but breaks the explicit iOS 15+ requirement.

## Consequences

- "iOS 15+" means iOS 15.1+, the floor React Native and Expo actually set.
- The App Store build of Expo Go runs a newer SDK, so development uses a development build.
- Library versions follow SDK 55's pinned set (`npx expo install`), not npm `latest`.
- Store policies are unaffected: they govern the SDK the app is built with (Xcode 26, target API 36), not the lowest OS it supports.

Sources: https://docs.expo.dev/versions/latest/ (SDK support table), https://expo.dev/changelog/sdk-56, https://reactnative.dev/docs/releases
