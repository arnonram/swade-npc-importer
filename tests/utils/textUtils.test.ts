import {
  capitalize,
  capitalizeEveryWord,
  specialAbilitiesLink,
  removeMultipleWhitespaces,
  swidLookupKey,
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
        index: [
          { name: 'Fear', uuid: 'abc123' },
          { name: 'Dark Vision', uuid: 'xyz789' },
          { name: 'Size -1', uuid: 'sizeLink' },
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
    expect(capitalize('this\'s fine')).toBe('This\'s Fine');
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
    expect(specialAbilitiesLink('Fear')).toBe('@UUID[abc123]{Fear}');
    expect(specialAbilitiesLink('Size -1')).toBe('@UUID[sizeLink]{Size -1}');
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

describe('swidLookupKey', () => {
  it.each([
    ['Improved Frenzy', 'improved-frenzy'],
    ['Holy/Unholy Warrior', 'holyunholy-warrior'],
    ['Can\'t Swim', 'cant-swim'],
    ['H&K MP5 Magazine', 'hk-mp5-magazine'],
    ['Laser Battery, Rifle / SMG', 'laser-battery-rifle-smg'],
    ['Arcane Background (Magic)', 'arcane-background-magic'],
    ['Fleet-Footed', 'fleet-footed'],
  ])('matches name "%s" to swid "%s"', (name, swid) => {
    expect(swidLookupKey(name)).toBe(swidLookupKey(swid));
  });

  it('ignores word order', () => {
    expect(swidLookupKey('Frenzy Improved')).toBe(
      swidLookupKey('improved-frenzy'),
    );
  });

  it('keeps different items apart', () => {
    expect(swidLookupKey('Frenzy')).not.toBe(swidLookupKey('improved-frenzy'));
  });
});

describe('splitAndTrim', () => {
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
