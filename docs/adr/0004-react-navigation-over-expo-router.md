# React Navigation instead of expo-router

Expo's default is file-based routing with expo-router, but this app configures its routes explicitly with React Navigation 7's native stack, in one typed file. That fits the layer-first `screens/` folder, the app needs no deep links, and from SDK 56 expo-router forks away from React Navigation, which would add churn at the planned SDK upgrade (see ADR-0002).

## Considered Options

- **expo-router**: file-based routes and deep links for free, but it imposes the `app/` layout, where route files end up as thin re-exports of the real screens.
