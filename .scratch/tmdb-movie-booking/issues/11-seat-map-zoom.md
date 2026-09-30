# 11: Seat map zoom

**What to build:** The user can zoom the hall in and out with + and − buttons to tap seats accurately on any screen size and orientation, without losing their place and without blurry seats.

**Blocked by:** 10 (Seat map: layout and selection)

**Status:** resolved

- [x] Zoom levels are relative to the measured width of the hall area: fit to width, then 1.5× and 2.25× of fit, with seat size capped at a comfortable maximum.
- [x] The hall starts at fit and scrolls in both directions.
- [x] Changing the zoom keeps the visible centre in place.
- [x] Zoom re-lays out seats at the new size and never scales with transforms, so seats stay sharp.
- [x] + disables at the largest level and − at fit; both are labelled for screen readers.
- [x] Levels recompute after rotation and on narrow and wide windows.
- [x] Behaviour tests: + and − change the level and disable at the ends; seats stay pressable after zooming.

## Decisions made while building

- The rule is `zoomSlotSizes(slotSizeToFit)` in `src/lib/zoom.ts`: the slot sizes the zoom steps through, smallest first. Fit, then 1.5 and 2.25 times fit. `useZoom()` (`src/hooks/useZoom.ts`) holds the chosen level as component state and gives the slot size, whether each button can be pressed, and the two steps.
- Two maximums, not one. A slot at fit stops at 32 dp, as ticket 10 set it, so a wide window doesn't fill with huge seats. A zoomed slot stops at 48 dp, the touch target Android recommends. With one maximum of 32 dp, a phone on its side would have no zoom at all, because fit already reaches it there.
- A level that would be no larger than the one before it is left out. A 390 dp phone has three levels (13.6, 20.4 and 30.6 dp). A phone on its side, or a tablet, has two (32 and 48 dp). So + always disables when the seats can't get larger, and − never does nothing.
- The chosen level is kept when the levels change. Zoomed to the third level and turned on its side, the phone shows the second of two levels, and turned back it shows the third again.
- `HallView` now takes the `slotSize` it lays out at, and exports `slotSizeToFit(rows, width)`. Seats are laid out again at the new size. Nothing is scaled with a transform.
- The hall area's width is measured with `onLayout`. Until its first layout the width is worked out from the window (less the safe-area insets), which gives the same number. So the first frame is already right, and Jest, which has no layout pass, still renders the hall.
- Two scroll views, one inside the other, because a React Native scroll view scrolls one way: the outer one down, the inner one across. The paddings are on the inner one's content, so a sideways drag works anywhere in the hall area. A finger moves the hall along one axis at a time.
- Keeping the visible centre is `useKeepCentre(axis)` (`src/hooks/useKeepCentre.ts`), used once for each scroll view. It remembers the scroll offset, the view's length and the content's length. When the content's length changes, it scrolls so the point of the content that was at the middle of the view is at the middle again. It also runs on rotation.
- The scroll happens one frame after the content changes size. Without the wait, Android stopped the scroll at the old content's end: the first zoom in stayed at the left edge. The cost is that the hall shows at the old offset for about two frames before it settles (seen in a screen recording). A native scroll view can't take a new size and a new offset in the same frame from JS.
- `ZoomControls` is a row of two round 40 dp buttons (48 dp with their hit slop) over the bottom right of the hall area, labelled "Zoom out" and "Zoom in", each disabled and dimmed at its end. The icons are `Minus` and `Plus` in `src/components/icons`.
- The hall's scroll content ends with 64 dp of padding (`ZOOM_CONTROLS_ROOM`), so the last row scrolls clear of the buttons. At fit the hall sits 26 dp above the middle of its area because of it.
- The toast moved up to sit above the zoom controls (`bottom-16` in `Toast`). At the bottom it overlapped them on a narrow phone.
- Tests: `SeatMapScreen.test.tsx` gains six. They press "Zoom in" and "Zoom out" and read a seat's laid-out size: 1.5 and 2.25 times fit in portrait, 32 then 48 dp in landscape, the ends disabled, a seat still pressable and the selection kept across zooms, and the levels worked out again on rotation. Keeping the centre and scrolling both ways need a layout pass, so they were checked on devices, not in Jest.
- Verified: `npm run check` passes (typecheck, lint with no warnings, 175 tests). On the Pixel 9 Pro emulator (API 35): the hall starts at fit with − dimmed; each + lays the seats out larger and keeps the centre; + dims at the third level; after a scroll to the right end, − and + keep what was in the middle; the hall scrolls both ways; in landscape there are two levels, the last row scrolls clear of the buttons, and turning back to portrait fits the hall again; a ninth seat shows the toast above the buttons. On the iPhone 17 Pro simulator (iOS 26.5): fit, then both zoom levels and a zoom out, each with the centre kept (the zoom steps were fired by a temporary timer, because taps from the agent's tool don't land reliably there). Not checked: a finger scroll and landscape on iOS, a screen reader on either platform, and the iOS 18.5 simulator.
- Known:
  - In phone landscape the hall area is about 105 dp tall, so two or three rows show at once and the zoom controls cover part of the rightmost seats until the hall is scrolled. This follows from fitting the width in a short window (ticket 10).
  - Row numbers scroll away with the hall when it is zoomed and scrolled sideways.

## Comments

**2026-09-30, context from ticket 10**

- `HallView` takes the `width` to fit and works out the slot size itself: the width less the row numbers' room, divided by the slots across, capped at `MAX_SLOT_SIZE` (32 dp). `SeatMapScreen` passes the window's width less the insets and a 16 dp margin. Nothing is measured with `onLayout` yet.
- The hall sits in a vertical `ScrollView` inside a `flex-1` view. Zoom needs it to scroll both ways and to keep the visible centre.
- In phone landscape the fit already reaches the 32 dp cap, so every zoom level would be the same size there.
- Jest has no layout pass: `onLayout` never fires unless a test fires it, so a hall sized only from a measured width renders nothing in tests.
- Icons for + and − go in `src/components/icons`.
- The seat map tests find seats by their labels (`availableSeats()`, `placeOf()` in `SeatMapScreen.test.tsx`).
