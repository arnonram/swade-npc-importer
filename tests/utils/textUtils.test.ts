import {
  capitalize,
  capitalizeEveryWord,
  specialAbilitiesLink,
  removeMultipleWhitespaces,
  swidLookupKey,
  matchesSwid,
  slashNameVariants,
  joinBrokenLines,
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

describe('matchesSwid', () => {
  it.each([
    ['Boost/Lower Trait', 'boostlower-trait'],
    ['Light/Darkness', 'light-darkness'],
    ['Detect/Conceal Arcana', 'detectconceal-arcana'],
    ['Improved Frenzy', 'improved-frenzy'],
  ])('matches "%s" to "%s"', (name, swid) => {
    expect(matchesSwid(name, swid)).toBe(true);
  });

  it('does not match different items', () => {
    expect(matchesSwid('Light', 'light-darkness')).toBe(false);
  });
});

describe('slashNameVariants', () => {
  it('expands a shared suffix', () => {
    expect(slashNameVariants('Boost/Lower Trait')).toEqual([
      'Boost Trait',
      'Lower Trait',
    ]);
    expect(slashNameVariants('Detect/Conceal Arcana')).toEqual([
      'Detect Arcana',
      'Conceal Arcana',
    ]);
  });

  it('splits plain alternatives', () => {
    expect(slashNameVariants('Light / Darkness')).toEqual([
      'Light',
      'Darkness',
    ]);
  });

  it('returns nothing for names without a slash', () => {
    expect(slashNameVariants('Bolt')).toEqual([]);
  });
});

describe('joinBrokenLines', () => {
  it('rejoins words hyphenated across a line break', () => {
    expect(
      joinBrokenLines('Arcane Background (Any Magic-\nBased), Fleet-\n Footed'),
    ).toBe('Arcane Background (Any Magic-Based), Fleet-Footed');
  });

  it('removes soft hyphens', () => {
    expect(joinBrokenLines('Intimi\u00addation d8, Intimi\u00ad\ndation')).toBe(
      'Intimidation d8, Intimidation',
    );
  });

  it('rejoins a slash at the end of a line', () => {
    expect(joinBrokenLines('boost/\nlower Trait')).toBe('boost/lower Trait');
  });

  it('keeps ordinary line breaks', () => {
    expect(joinBrokenLines('Pace: 6;\nParry: 5')).toBe('Pace: 6;\nParry: 5');
  });
});
