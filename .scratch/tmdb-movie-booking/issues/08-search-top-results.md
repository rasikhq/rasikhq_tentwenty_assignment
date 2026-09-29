# 08: Search with live Top Results

**What to build:** Movie List's search button opens Search, where results appear as the user types and always match what's currently in the field, never an older query (ADR-0001). Tapping a result opens the movie's detail.

**Blocked by:** 05 (Movie detail)

**Status:** ready-for-agent

- [ ] Movie List's header gains a search button that opens Search.
- [ ] The search field's placeholder reads "Search movies" and it isn't auto-focused. Its button clears the text when there is text and closes Search when the field is empty, with matching accessibility labels.
- [ ] Before any typing, Search shows a simple prompt (ticket 12 replaces it with the genre grid).
- [ ] Terms are normalized (trimmed, lowercased, spaces collapsed). Requests are debounced by about 300 ms, keyed by the normalized term, and cancelled through `AbortSignal` when overtaken. `keepPreviousData` is not used.
- [ ] Results render only when their term equals the current normalized input; otherwise a searching row shows. A term that's already cached shows instantly, for example on backspace.
- [ ] "Top Results" rows show a thumbnail, the title and the first genre name, from the first page only, with no "…" menu. Genre names come from the genre list, fetched once, stale after 7 days, and persisted.
- [ ] No match shows "No movies match '<term>'". Offline with an uncached term shows a needs-a-connection state, while terms searched earlier in the session still show. Search results are never persisted.
- [ ] Tapping a row opens Movie Detail with the row's data as placeholder data.
- [ ] Unit tests for term normalization.
- [ ] Behaviour tests: when an older request resolves last, its results never show; the no-match message; the offline state; a row opens the detail.
