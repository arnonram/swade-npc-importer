import { describe, it, expect } from 'vitest';
import {
  isChecked,
  isLastSavedFolder,
  buildFolderOptions,
} from '../../src/utils/dialogUtils';

describe('dialogUtils', () => {
  describe('isChecked', () => {
    it('returns "checked" if values are equal', () => {
      expect(isChecked('a', 'a')).toBe('checked');
      expect(isChecked(1, 1)).toBe('checked');
      expect(isChecked(true, true)).toBe('checked');
    });
    it('returns empty string if values are not equal', () => {
      expect(isChecked('a', 'b')).toBe('');
      expect(isChecked(1, 2)).toBe('');
      expect(isChecked(true, false)).toBe('');
    });
  });

  describe('isLastSavedFolder', () => {
    it('returns "selected" if values are equal and not undefined', () => {
      expect(isLastSavedFolder('foo', 'foo')).toBe('selected');
      expect(isLastSavedFolder('', '')).toBe('selected');
    });
    it('returns empty string if values are not equal or lastFolder is undefined', () => {
      expect(isLastSavedFolder('foo', 'bar')).toBe('');
      expect(isLastSavedFolder(undefined, 'foo')).toBe('');
    });
  });

  describe('buildFolderOptions', () => {
    it('returns options with correct selected', () => {
      const html = buildFolderOptions('foo', ['foo', 'bar']);
      expect(html).toContain("<option value='' >--</option>");
      expect(html).toContain('<option value="foo" selected>foo</option>');
      expect(html).toContain('<option value="bar" >bar</option>');
    });
    it('returns options with -- selected if lastSave is empty', () => {
      const html = buildFolderOptions('', ['foo']);
      expect(html).toContain("<option value='' selected>--</option>");
    });
  });
});
