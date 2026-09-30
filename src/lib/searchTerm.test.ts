import { normalizeSearchTerm } from './searchTerm';

test.each([
  ['leaves a lowercase word as it is', 'dune', 'dune'],
  ['lowercases capitals', 'Dune', 'dune'],
  ['lowercases accented capitals', 'AMÉLIE', 'amélie'],
  ['trims spaces at the start', '  dune', 'dune'],
  ['trims spaces at the end', 'dune  ', 'dune'],
  ['keeps one space between words', 'dune part two', 'dune part two'],
  ['collapses several spaces between words', 'dune   part    two', 'dune part two'],
  ['turns tabs and line breaks into one space', 'dune\tpart\n two', 'dune part two'],
  ['does all of it at once', '  The  BATMAN ', 'the batman'],
  ['keeps digits and punctuation', 'Se7en: 2', 'se7en: 2'],
])('search term normalization %s', (_rule, typed, term) => {
  expect(normalizeSearchTerm(typed)).toBe(term);
});

test.each([
  ['nothing', ''],
  ['only spaces', '   '],
  ['only tabs and line breaks', '\t\n'],
])('text with %s normalizes to an empty search term', (_what, typed) => {
  expect(normalizeSearchTerm(typed)).toBe('');
});
