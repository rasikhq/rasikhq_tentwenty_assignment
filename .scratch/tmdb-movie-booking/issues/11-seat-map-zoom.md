# 11: Seat map zoom

**What to build:** The user can zoom the hall in and out with + and − buttons to tap seats accurately on any screen size and orientation, without losing their place and without blurry seats.

**Blocked by:** 10 (Seat map: layout and selection)

**Status:** ready-for-agent

- [ ] Zoom levels are relative to the measured width of the hall area: fit to width, then 1.5× and 2.25× of fit, with seat size capped at a comfortable maximum.
- [ ] The hall starts at fit and scrolls in both directions.
- [ ] Changing the zoom keeps the visible centre in place.
- [ ] Zoom re-lays out seats at the new size and never scales with transforms, so seats stay sharp.
- [ ] + disables at the largest level and − at fit; both are labelled for screen readers.
- [ ] Levels recompute after rotation and on narrow and wide windows.
- [ ] Behaviour tests: + and − change the level and disable at the ends; seats stay pressable after zooming.

## Comments

**2026-09-30, context from ticket 10**

- `HallView` takes the `width` to fit and works out the slot size itself: the width less the row numbers' room, divided by the slots across, capped at `MAX_SLOT_SIZE` (32 dp). `SeatMapScreen` passes the window's width less the insets and a 16 dp margin. Nothing is measured with `onLayout` yet.
- The hall sits in a vertical `ScrollView` inside a `flex-1` view. Zoom needs it to scroll both ways and to keep the visible centre.
- In phone landscape the fit already reaches the 32 dp cap, so every zoom level would be the same size there.
- Jest has no layout pass: `onLayout` never fires unless a test fires it, so a hall sized only from a measured width renders nothing in tests.
- Icons for + and − go in `src/components/icons`.
- The seat map tests find seats by their labels (`availableSeats()`, `placeOf()` in `SeatMapScreen.test.tsx`).
