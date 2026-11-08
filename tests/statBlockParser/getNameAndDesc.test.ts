import { describe, it, expect } from 'vitest';
import {
  getName,
  getBio,
  hasWildCardMarker,
} from '../../src/statBlockParser/getNameAndDesc';

describe('getName', () => {
  it('extracts and capitalizes the first line as name', () => {
    const input =
      'redcap\nredcaps are vicious creatures.\nAttributes: Agility d6';
    const result = getName(input);
    expect(result).toBe('Redcap');
  });

  it('returns empty string if input is empty', () => {
    const result = getName('');
    expect(result).toBe('');
  });
});

describe('getBio', () => {
  it('extracts description and formats it with <br>', () => {
    const input =
      'Redcap\nRedcaps are goblins.\nTheir hats are red.\nAttributes: Agility d6';
    const sections: string[] = [];
    const result = getBio(input, sections);
    expect(result).toContain(
      'Redcaps are goblins.<br/> Their hats are red.<br/>',
    );
  });

  it('appends conviction if found in sections', () => {
    const input = 'Redcap\nA terrifying goblin.\nAttributes: Strength d8';
    const sections = ['Conviction: d6'];
    const result = getBio(input, sections);
    expect(result).toContain('Conviction: d6<hr>');
    expect(result).toContain('A terrifying goblin');
  });

  it('returns only biography if no conviction found', () => {
    const input = 'Redcap\nGoblins are ugly.\nAttributes: d6';
    const result = getBio(input, []);
    expect(result).not.toContain('<hr>');
  });
});

describe('Wild Card marker', () => {
  const raw = 'D CHIEFTAIN\nAttributes: Agility d6';

  it('drops the PDF Wild Card symbol ("D ") from the name', () => {
    expect(getName(raw)).toBe('Chieftain');
  });

  it('detects the marker', () => {
    expect(hasWildCardMarker(raw)).toBe(true);
    expect(hasWildCardMarker('CHIEFTAIN\nAttributes: Agility d6')).toBe(false);
  });

  it('does not treat a real name starting with D as a marker', () => {
    expect(hasWildCardMarker('D’Artagnan\nAttributes: Agility d6')).toBe(false);
    expect(hasWildCardMarker('D Goblin chief\nAttributes: Agility d6')).toBe(
      false,
    );
  });
});
