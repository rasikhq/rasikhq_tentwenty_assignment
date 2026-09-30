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

**Movie detail**:
The screen for one movie: its image and title at once, then the release line, genre chips, overview and a strip of images. Movies the user has opened stay available offline.
_Avoid_: Details page, movie page

**Search**:
The screen for finding a movie by its title, opened from the movie list's search button.
_Avoid_: Search page, finder

**Search term**:
What the user typed into Search, once trimmed, lowercased and with each run of spaces collapsed to one. Results belong to the search term they were asked for.
_Avoid_: Query (TMDb's name for the request parameter), keyword

**Top Results**:
The movies Search lists while the user types: the first page of matches for the current search term.
_Avoid_: Suggestions, live results

**Release line**:
The movie detail's line under the title: "In Theaters <date>" for a bookable movie, "Released <date>" for any other.

**Offline banner**:
A slim note above saved movies, or a saved movie detail, saying the user is offline and the screen shows saved data.

**Offline state**:
The message, with Retry, that takes a screen's content area offline when nothing is saved to show there.

### Movies

**Genre**:
A category TMDb assigns to movies, such as Comedy or Crime. A movie can belong to several.
_Avoid_: Category

**Genre list**:
Every genre TMDb has for movies, with its name, saved on the device. A movie in a list carries only the ids of its genres, and the genre list names them.

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
