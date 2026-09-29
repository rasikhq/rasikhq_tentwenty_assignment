# Search results are keyed by term, not by arrival order

Search must never show results for a query the user has moved past. Every search response is stored under its normalized term (trimmed, lowercased, spaces collapsed) as the TanStack Query key `['search', term]`, so a late response can only land in its own term's slot, and the screen renders results only when their term equals the current normalized input; otherwise it shows a searching state. Debouncing (~300 ms) and `AbortSignal` cancellation cut load, but neither is what makes the results correct.

## Considered Options

- **Latest-request-wins counter**: fixes out-of-order responses, but has no cache, so backspacing to an earlier term refetches it.
- **Abort-only or debounce-only**: narrows the race without closing it; a response can finish parsing just before the abort lands.
- **`placeholderData: keepPreviousData`**: smooth, but shows the previous term's results while the new ones load, which is exactly what the brief forbids.

## Consequences

- Each term that survives the debounce creates its own cache entry. Search results stay in memory only and are never persisted to disk.
