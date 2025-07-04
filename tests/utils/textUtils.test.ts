import {
  capitalize,
  capitalizeEveryWord,
  specialAbilitiesLink,
  removeMultipleWhitespaces,
  splitAndSort,
  splitAndTrim,
  lowerCaseShishKebab,
  removeEmptyArrayProp,
} from '../../src/utils/textUtils'; // adjust path as needed

import { describe, it, expect, vi } from 'vitest';
// Mocks
vi.stubGlobal('game', {
  packs: new Map([
    [
      'swade-core-rules.swade-specialabilities',
      {
        contents: [
          { name: 'Fear', link: '@UUID[abc123]' },
          { name: 'Dark Vision', link: '@UUID[xyz789]' },
          { name: 'Size -1', link: '@UUID[sizeLink]' },
        ],
      },
    ],
  ]),
});

describe('capitalize', () => {
  it('capitalizes the first letter of each word', () => {
    expect(capitalize('hello world')).toBe('Hello World');
  });

  it('preserves internal punctuation', () => {
    expect(capitalize("this's fine")).toBe("This's Fine");
  });
});

describe('capitalizeEveryWord', () => {
  it('capitalizes every word and preserves punctuation', () => {
    expect(capitalizeEveryWord('dark vision')).toBe('Dark Vision');
    expect(capitalizeEveryWord('size -1')).toBe('Size -1');
  });
});

describe('specialAbilitiesLink', () => {
  it('returns a valid link for a matching name', () => {
    expect(specialAbilitiesLink('Fear')).toBe('@UUID[abc123]');
    expect(specialAbilitiesLink('Size -1')).toBe('@UUID[sizeLink]');
  });

  it('returns an empty string when nothing matches', () => {
    expect(specialAbilitiesLink('Unknown Ability')).toBe('');
  });

  it('returns an empty string on error', () => {
    vi.stubGlobal('game', {}); // simulate broken `game.packs`
    expect(specialAbilitiesLink('Fear')).toBe('');
  });
});

describe('removeMultipleWhitespaces', () => {
  it('removes redundant whitespace', () => {
    expect(removeMultipleWhitespaces('  hello   world ')).toBe(' hello world ');
  });
});

describe('splitAndSort', () => {
  it('splits on space/comma and sorts', () => {
    expect(splitAndSort('Magic, Stealth Fighting')).toEqual([
      'fighting',
      'magic',
      'stealth',
    ]);
  });

  it('handles redundant spaces and casing', () => {
    expect(splitAndSort('  STR  , Agility')).toEqual(['agility', 'str']);
  });
});

describe('splitAndTrim', () => {
  const newLineRegex = /\n/g;

  it('splits using a separator and trims', () => {
    expect(splitAndTrim('foo\nbar\nbaz', /\n/)).toEqual(['foo', 'bar', 'baz']);
  });

  it('removes empty strings after split', () => {
    expect(splitAndTrim('a,,b, ,c', /,/)).toEqual(['a', 'b', 'c']);
  });
});

describe('lowerCaseShishKebab', () => {
  it('converts first word to lowercase kebab-case', () => {
    expect(lowerCaseShishKebab('Hello World')).toBe('hello');
    expect(lowerCaseShishKebab('Multi Word Phrase')).toBe('multi');
  });
});

describe('removeEmptyArrayProp', () => {
  it('removes strings with no letters', () => {
    expect(removeEmptyArrayProp(['abc', '123', '!!!', 'def'])).toEqual([
      'abc',
      'def',
    ]);
  });

  it('removes empty or space-only strings', () => {
    expect(removeEmptyArrayProp([' ', '', 'abc'])).toEqual(['abc']);
  });
});
