# 05: Movie detail

**What to build:** Tapping a movie opens its detail instantly (image and title from the list's data) and fills in the rest from one request: the release line, genre chips, overview and an image strip. Details the user has opened stay available offline.

**Blocked by:** 04 (Offline movie list)

**Status:** ready-for-agent

- [ ] The detail loads from `/movie/{id}` with videos and images appended in the same request (and `include_image_language=en,null`), mapped into an app movie detail type.
- [ ] The tapped movie's list data seeds the detail as placeholder data, so the image and title render immediately.
- [ ] The release line reads "In Theaters <date>" for a bookable movie (release date in the future or within the last 60 days) and "Released <date>" otherwise; a movie with no release date is not bookable. Dates read like "December 22, 2021".
- [ ] Genre chips cycle teal, pink, purple and gold; the overview follows; a strip of backdrop images sits under it and is hidden when there are none.
- [ ] Portrait: image on top. Above the wide breakpoint: the image takes the left half and the content scrolls on the right. A transparent header over the image holds the back button.
- [ ] Skeleton sections while loading; an error with Retry; opened details persist (stale after 24 hours) and show offline.
- [ ] No Get Tickets or Watch Trailer button yet (tickets 10 and 07 add them), so nothing on the screen is dead.
- [ ] Unit tests for the bookable movie rule, with the clock set through Jest system time.
- [ ] Behaviour tests: the placeholder title shows before the detail arrives; genres and overview render; an old movie shows "Released <date>"; an opened detail shows offline after a restart.
