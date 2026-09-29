# 10: Seat map: layout and selection

**What to build:** Get Tickets on a bookable movie opens the seat map for a mock showtime. The user sees Hall 1 laid out like the Figma, builds a selection of up to 8 seats shown as removable chips with a running total, and reaches an honest Proceed to pay summary.

**Blocked by:** 05 (Movie detail)

**Status:** ready-for-agent

- [ ] Get Tickets appears on Movie Detail only for a bookable movie and opens the seat map.
- [ ] Mock showtime: the later of today and the release date, at 12:30, in Hall 1. The header shows the movie title and "<date> | 12:30 Hall 1".
- [ ] The layout belongs to the hall: rows of segments, each either a run of seats of one seat type or a gap. Seats are numbered within their row, skipping gaps. A showtime points to a movie, a hall and a start time.
- [ ] Hall 1 mirrors the Figma: 10 numbered rows, three blocks split by two aisles, shorter front rows, row 10 VIP, and a "SCREEN" arc above row 1.
- [ ] Unavailable seats belong to the showtime and are generated deterministically from its identity (about a third of seats): the same on every visit, with nothing saved.
- [ ] Colours: Regular $50 sky blue, VIP $150 purple, an unavailable seat light grey and not pressable, a selected seat gold. The legend reads Selected, Not available, VIP ($150), Regular ($50).
- [ ] Tapping an available seat toggles it in the selection. A ninth seat is refused with a toast overlay that fades out and never shifts the layout.
- [ ] Selected seats appear as chips ("<seat> / <row> row" with a remove button) in a fixed-height row that scrolls sideways; the total sums the selected seats' prices.
- [ ] Proceed to pay is disabled while the selection is empty. Pressing it shows a summary (seats and total) stating that payment isn't part of this demo, and the user stays on the seat map.
- [ ] Leaving the seat map clears the selection.
- [ ] One memoized seat view per seat. Each seat's accessibility label reads like "Row 3, seat 4, Regular, 50 dollars, available" and exposes its selected state; an unavailable seat is announced as unavailable and disabled.
- [ ] The same layout order in both orientations: the hall takes the leftover height and the page doesn't scroll. Above the wide breakpoint (and in phone landscape) the legend compacts to one row, and the chips, total and button share one bottom row.
- [ ] Unit tests for hall layout to numbered seats and for deterministic unavailable seats.
- [ ] Behaviour tests: toggling a seat; an unavailable seat ignores taps; the 8-seat cap shows the toast; chips and total update and a chip removes its seat; Proceed to pay is disabled when empty and shows the summary otherwise; Get Tickets is hidden for an old movie.
