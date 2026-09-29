# Steering log

Where I overrode or corrected the agent's recommendation, and why. Entries are transcribed by Claude from my chat replies, keeping my wording.

## 2026-09-29 — Grilling (planning)

### Folder structure

Agent recommended feature-first folders (`src/features/<feature>/` holding each feature's screens, components and hooks), steered to layer-first folders (`screens/`, `components/`, `hooks/`, `services/`) instead because: it's the more standard practice I'm used to and have shipped. I haven't seen the feature-first approach in my experience, so I'd rather go with what I'm comfortable with. The agent's key boundary (only `src/api` knows TMDb's JSON shapes) can still work within this pattern by ensuring common items are in `src/lib`.

### Styling

Agent recommended plain `StyleSheet` with typed design tokens, steered to NativeWind, with basic components styled through it, instead because: styling the basic components with NativeWind means classes don't have to be spammed. React Native's biggest selling point is utilizing web knowledge; web is heavily opinionated with Tailwind, and seeing Tailwind-based classes is now a habit every developer is used to, so using that instinct and skill is justifiable.

### Search start state

Agent recommended replacing the Figma's genre grid (search, screen 2) with a plain empty state (icon and hint), steered to skipping screen 2 because it's extra, but keeping a non-dull start state instead because: a movie app showing nothing is a bad user experience, and the API gives us everything we need to show something rather than nothing, for a better user experience and first impression.

### Search start state (revised)

Agent then recommended showing cached upcoming movies as "Coming soon" rows, steered to implementing the Figma's genre grid (screen 2) with TMDb's genre and discover endpoints instead because: looking at the designs more closely, screen 2 is what the user sees on tapping search, showing the movie genres, so it should be implemented with the supported APIs available even if outside the assessment brief. It's easily defendable, a richer experience, and the API already gives the data within fewer than 3 network calls.

### Framework

Agent recommended bare React Native CLI 0.87 without Expo (the only option meeting every brief constraint literally), steered to Expo SDK 55 instead because: I would not drop Expo. The feature build relies on something Expo helps with (`expo-image`'s disk cache for offline posters), and adding Expo later over bare React Native isn't feasible without hitting the same iOS 16.4 floor, so SDK 55 keeps both Expo and iOS 15.
