# 10: Seat map: layout and selection

**What to build:** Get Tickets on a bookable movie opens the seat map for a mock showtime. The user sees Hall 1 laid out like the Figma, builds a selection of up to 8 seats shown as removable chips with a running total, and reaches an honest Proceed to pay summary.

**Blocked by:** 05 (Movie detail)

**Status:** resolved

- [x] Get Tickets appears on Movie Detail only for a bookable movie and opens the seat map.
- [x] Mock showtime: the later of today and the release date, at 12:30, in Hall 1. The header shows the movie title and "<date> | 12:30 Hall 1".
- [x] The layout belongs to the hall: rows of segments, each either a run of seats of one seat type or a gap. Seats are numbered within their row, skipping gaps. A showtime points to a movie, a hall and a start time.
- [x] Hall 1 mirrors the Figma: 10 numbered rows, three blocks split by two aisles, shorter front rows, row 10 VIP, and a "SCREEN" arc above row 1.
- [x] Unavailable seats belong to the showtime and are generated deterministically from its identity (about a third of seats): the same on every visit, with nothing saved.
- [x] Colours: Regular $50 sky blue, VIP $150 purple, an unavailable seat light grey and not pressable, a selected seat gold. The legend reads Selected, Not available, VIP ($150), Regular ($50).
- [x] Tapping an available seat toggles it in the selection. A ninth seat is refused with a toast overlay that fades out and never shifts the layout.
- [x] Selected seats appear as chips ("<seat> / <row> row" with a remove button) in a fixed-height row that scrolls sideways; the total sums the selected seats' prices.
- [x] Proceed to pay is disabled while the selection is empty. Pressing it shows a summary (seats and total) stating that payment isn't part of this demo, and the user stays on the seat map.
- [x] Leaving the seat map clears the selection.
- [x] One memoized seat view per seat. Each seat's accessibility label reads like "Row 3, seat 4, Regular, 50 dollars, available" and exposes its selected state; an unavailable seat is announced as unavailable and disabled.
- [x] The same layout order in both orientations: the hall takes the leftover height and the page doesn't scroll. Above the wide breakpoint (and in phone landscape) the legend compacts to one row, and the chips, total and button share one bottom row.
- [x] Unit tests for hall layout to numbered seats and for deterministic unavailable seats.
- [x] Behaviour tests: toggling a seat; an unavailable seat ignores taps; the 8-seat cap shows the toast; chips and total update and a chip removes its seat; Proceed to pay is disabled when empty and shows the summary otherwise; Get Tickets is hidden for an old movie.

## Decisions made while building

- Model, as the spec's data model says:
  - `src/lib/hall.ts` has the types (`Hall`, `Segment`, `Seat`, `SeatType`), the seat types' names and prices (`SEAT_TYPES`), and the rule `layOutHall(hall)`: each row becomes a line of seat-wide slots, a seat or `null` where a gap leaves the slot empty. Seats are numbered within their row and gaps take no numbers. A seat's id is `<row>-<number>`.
  - `src/data/halls.ts` holds the halls by id. Hall 1 is the only entry, and a new hall is a new entry.
  - `src/lib/showtime.ts` has `Showtime` (movie id, hall id, date, time, as the glossary defines it) and `showtimeFor(movieId, releaseDate)`: the later of today and the release date, at 12:30, in Hall 1.
  - `src/lib/unavailableSeats.ts` has `unavailableSeatIds(showtime, seats)`. A seat is unavailable when a hash (FNV-1a) of the showtime's identity and the seat's id divides by 3. Nothing is saved, and a different movie, hall, date or time gives different seats.
- Hall 1 could not be read from the Figma file in this session, so it follows the ticket's description: 10 rows and 210 seats, three blocks (5, 12, 5) split by two aisles, side blocks of 3 in row 1 and 4 in rows 2 to 4, and row 10 VIP. The shorter rows hold empty space in the data where their outer seats would be, so the aisles line up.
- Route params: `SeatMap: { title: string; showtime: Showtime }`. Movie detail builds the showtime when Get Tickets is pressed, so ticket 14 can pass a chosen showtime without changing the seat map.
- Get Tickets is the filled button, before Watch Trailer, in the hero of Movie detail. It shows once the detail has arrived and the movie is bookable.
- Seat size: the hall fits the window's width (the window less the safe-area insets and a 16 dp margin, less the row numbers' room), with a slot capped at 32 dp. It comes from the window size, not from a measured layout, so the first frame is already right and Jest, which has no layout pass, renders the hall. Ticket 11 owns the zoom levels.
- A seat's touch target is its whole slot, not only the coloured block. On a 390 dp wide phone a slot is about 14 dp, which is small until ticket 11 adds zoom.
- The hall sits in a vertical scroll view that takes the leftover height: a hall taller than that scrolls inside it and the page never scrolls. In phone landscape the hall fits the width, so about three rows show at once and the rest scroll.
- The screen's arc is drawn from views, with no SVG library: the top of a large circle's outline, clipped below its ends (`ScreenArc`).
- The selection is a reducer in `useSelection()` (`src/hooks/useSelection.ts`): the seats in the order picked, and a count of refusals. `toggle` and `remove` are stable functions, so `SeatView` (wrapped in `memo`) renders again only when its own seat changes. A chip's remove button uses `remove`, so a second tap on it can't put the seat back.
- The toast (`Toast`) is mounted with a new `key` for each refusal, so a second refused tap starts it again. It fades in, stays 1.8 seconds, fades out and unmounts. It lies over the bottom of the hall area, takes no touches and moves nothing. It is also read out to a screen reader.
- Proceed to pay opens `SelectionSummary`, a transparent React Native `Modal` over the seat map: each seat with its seat type and price, the total, and "Payment isn't part of this demo, so nothing is booked." Close, or Android back, returns to the seat map with the selection as it was.
- The empty chips row says "No seats selected" and keeps its height, so the first chip moves nothing.
- The header's second line is grey, not the Figma's sky blue, which is too faint to read on white.
- Compact layout (legend in one row; chips, total and button in one row) applies at or above the wide breakpoint, or when the window is wider than it is tall, which covers a small phone on its side.
- The bottom bar's white runs under the display cutout in landscape, and its content clears it.
- `Button` gains `disabled`, `Cross` gains `small`, and `dates.ts` gains `today()`.
- `CLAUDE.md`'s list of directly unit-tested rules now names unavailable seats for a showtime, which this ticket asks for.
- Tests: `hall.test.ts` (9) and `unavailableSeats.test.ts` (8) test the two rules directly. `SeatMapScreen.test.tsx` (17) drives the whole app from Movie list through Get Tickets. It finds seats by what they say of themselves ("Row 3, seat 4, Regular, 50 dollars, available"), so no test depends on which seats the hash makes unavailable. `MovieDetailScreen.test.tsx` gains three tests for Get Tickets. The toast test waits for the toast to leave, which takes about 2.3 seconds of real time.
- Verified: `npm run check` passes (typecheck, lint with no warnings, 169 tests). On the Pixel 9 Pro emulator (API 35): Get Tickets opens the seat map with the header, arc, 10 rows and legend; seats toggle to gold with chips and the total; a ninth seat shows the toast and changes nothing; Proceed to pay shows the summary, and Android back closes it with the selection intact; landscape puts the legend in one row and the chips, total and button in one row, and the hall scrolls to row 10; leaving and returning shows an empty selection and the same unavailable seats. On the iPhone 17 Pro simulator (iOS 26.5): the seat map renders the same, and a tapped seat is selected with its chip (seen by temporarily starting the app on the seat map). Not checked: iOS landscape, the summary on iOS, a screen reader on either platform, and the iOS 18.5 simulator.
- Known:
  - In phone landscape only about three rows of the hall show at once, because the hall fits the width as the spec says. Fitting the height too would show the whole hall with much smaller seats.
  - Light grey unavailable seats are faint on the off-white page. The spec names that colour.
