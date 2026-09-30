/**
 * The search term for what the user typed: trimmed, lowercased, with each run of spaces collapsed to one.
 * Texts that differ only in case or spacing share one term, so they share one request and one set of
 * cached results (ADR-0001). Text with nothing but spaces has an empty term, which searches for nothing.
 */
export function normalizeSearchTerm(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}
