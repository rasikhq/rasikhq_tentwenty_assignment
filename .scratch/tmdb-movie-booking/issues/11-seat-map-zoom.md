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
