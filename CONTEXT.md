# TMDb Movie Booking

An app that lists upcoming movies from TMDb, shows their details and trailers, finds movies by search or genre, and takes the user as far as picking seats for a showtime. Booking stops at seat selection: there is no payment.

## Language

### App

**Movie list**:
The screen the app opens on: the upcoming movies as large cards under the Watch header.
_Avoid_: Home, feed, Watch screen

**Saved movies**:
The movies the app kept on the device from its last successful load, shown when TMDb can't be reached.
_Avoid_: Cached movies, offline movies

**Offline banner**:
A slim note above saved movies saying the user is offline and the screen shows saved movies.

**Offline state**:
The full-screen message, with Retry, shown offline when there are no saved movies to show.

### Movies

**Genre**:
A category TMDb assigns to movies, such as Comedy or Crime. A movie can belong to several.
_Avoid_: Category

**Trailer**:
The official YouTube video TMDb lists for a movie with type "Trailer", or type "Teaser" when no trailer exists. A movie with neither has no trailer.
_Avoid_: Video, clip, preview

**Bookable movie**:
A movie that is upcoming or still in theaters: its release date is in the future or within the last 60 days. Only bookable movies offer tickets.
_Avoid_: Now playing (TMDb uses that name for a different list)

### Booking

**Showtime**:
A movie scheduled at a specific date, time and hall.
_Avoid_: Session, screening, show

**Hall**:
A room in the cinema with its own fixed seat layout. Halls differ in size and shape, and a movie can play in several.
_Avoid_: Auditorium, screen, room

**Seat map**:
A hall's seat layout for one showtime, showing which seats are available.
_Avoid_: Seat mapping, seating chart

**Seat**:
A single place in a hall, identified by its row and its number in that row.

**Seat type**:
The kind of seat, which sets its price: Regular or VIP.
_Avoid_: Tier, class

**Unavailable seat**:
A seat that can't be picked for a showtime because someone else already has it.
_Avoid_: Taken, booked, occupied

**Selection**:
The seats the user has picked on the seat map, before any booking happens.
_Avoid_: Cart, basket, reservation
