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

### Hall layout

Agent recommended one hall definition, with unavailable seats derived from the movie id, steered to keeping the seat layout per hall and availability per showtime instead because: my instinct for edge cases asked whether halls always share a layout. A movie can play in different halls with different layouts, so the layout belongs to the hall and availability to the showtime, and the seat map scales to many halls without changing.

### Seat rendering (claim corrected)

Agent recommended one memoized view per seat over SVG, arguing that SVG shapes each need their own touch handling. I questioned that claim, since SVG is what I generally consider, and raised the caveat of blurry looks. The claim was wrong: `react-native-svg` shapes take `onPress` directly. Views stayed for per-seat accessibility labels and NativeWind styling, and zoom works by re-laying out seats at the new size so they stay sharp.

### Seat map in landscape

Agent recommended splitting the seat map in landscape (hall on the left; legend, chips, total and button in a right-hand panel), steered to keeping the same layout and just scaling it instead because: a consistent layout is more natural, and splitting the view that way might not be the best to look at.

## 2026-09-30 — Ticket 08 (search)

### Icons

Agent drew the search icon as its own component (`Magnifier`) but left other icons inline in the components that use them, such as the "X" in the search field, steered to turning every icon into a re-usable component under `components/icons` instead because: the Magnifier was correctly made a component, since we avoided yet another dependency for icons just because we need a couple or more (noted as such: in a real app with a lot of icons, a proper icon set or library would be used). However, some "icons" were still inline and should be correctly turned into re-usable components, one example being the "X" in search. Putting these under `components/icons` is a small improvement, a split from the usual components.

## 2026-09-30 — Tickets 10 and 11 (seat map)

### Review of the seat map as one feature

Agent asked to run the code review after ticket 11 alone, steered to reviewing tickets 10 and 11 together instead because: I skipped 10's review to combine it with 11 as a full feature.

### Toast (challenged, kept)

Agent built its own toast component for the 8-seat refusal. I challenged it: inventing a toast is overengineering for this demo, however if invoking a native toast requires a dependency, it's acceptable. The agent checked: Android has a native toast in React Native core (`ToastAndroid`), but iOS has no system toast, so a native one on iOS needs a library that draws its own view, and the two candidates (`burnt`, `react-native-simple-toast`) last released about 18 and 20 months ago. I kept the agent's own toast.

### Seat shape

Agent drew a seat as one block, rounder at the back (it couldn't read the Figma file in that session), steered to the Figma's seat instead, from a screenshot of the Figma legend, because: the swatch could be improved to represent this shape, more closely to the provided Figma, and it shouldn't be more complicated than the current custom shape.
