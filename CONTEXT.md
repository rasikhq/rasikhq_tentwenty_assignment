# TMDb Movie Booking

An app that lists upcoming movies from TMDb, shows their details and trailers, finds movies by search or genre, and takes the user as far as picking seats for a showtime. Booking stops at seat selection: there is no payment.

## Language

**Genre**:
A category TMDb assigns to movies, such as Comedy or Crime. A movie can belong to several.
_Avoid_: Category

**Trailer**:
The official YouTube video TMDb lists for a movie with type "Trailer", or type "Teaser" when no trailer exists. A movie with neither has no trailer.
_Avoid_: Video, clip, preview

**Showtime**:
A single screening of a movie at a date, a time and a hall.
_Avoid_: Session, screening, show
