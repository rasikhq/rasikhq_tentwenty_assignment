# 15: Stretch: pinch-to-zoom on the seat map

**What to build:** The user can pinch to zoom the hall, in addition to the + and − buttons.

**Blocked by:** 11 (Seat map zoom). Start only after 13 (priority: a submittable release exists first).

**Status:** ready-for-agent

- [ ] Pinching zooms smoothly between fit and the largest level on both platforms, and the + and − buttons stay in sync.
- [ ] At the end of a pinch the hall settles into a re-layout at the new size, so seats stay sharp and pressable.
- [ ] gesture-handler and reanimated are added at SDK 55's pinned versions, and the README records the added dependencies and why.
