import { describe, it, expect } from 'vitest';
import { TMIDI_REGEX } from '../consts.js';

describe('consts', () => {
  it('noteName matches pitch with octave', () => {
    expect(TMIDI_REGEX.noteName.test('C4')).toBe(true);
    expect(TMIDI_REGEX.noteName.test('G#-1')).toBe(true);
    expect(TMIDI_REGEX.noteName.test('H4')).toBe(false);
  });

  it('noteWithAnyOctave captures base and octave', () => {
    const m = 'A#3'.match(TMIDI_REGEX.noteWithAnyOctave);
    expect(m).not.toBeNull();
    expect(m![1]).toBe('A#');
    expect(m![2]).toBe('3');
  });

  it('velocitySuffix and repeatSuffix work', () => {
    expect('C4:80'.match(TMIDI_REGEX.velocitySuffix)![1]).toBe('80');
    expect('| C4 *2'.match(TMIDI_REGEX.repeatSuffix)![1]).toBe('2');
  });
});
