# 12: Genre browse

**What to build:** Before typing, Search shows a grid of genres (the Figma's screen 02), each tile with an image from a movie in that genre, and tapping a genre opens Results for it. This is the first ticket to cut if time runs short.

**Blocked by:** 09 (Search results screen). Start only after 07 and 11 (priority: the four brief screens come first).

**Status:** ready-for-agent

- [ ] Search's idle state shows the genre grid from the genre list: 2 columns below the wide breakpoint, 4 above.
- [ ] A tile's image is the backdrop of a cached upcoming movie in that genre (no extra requests); a genre with no match gets a solid palette-colour tile.
- [ ] Tapping a tile opens Results for that genre from `/discover/movie?with_genres=<id>`, with the genre name as the header and more pages on scroll.
- [ ] Genre results stay in memory only; offline, a genre not browsed this session shows the needs-a-connection state.
- [ ] Tiles are labelled for screen readers.
- [ ] Behaviour tests: the grid lists genres; a genre without a cached movie falls back to a colour tile; tapping a genre shows its movies.
