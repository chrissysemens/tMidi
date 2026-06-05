import { describe, it, expect } from 'vitest';
import { normalizeChordQuality, stripVelocity, stripRepeat } from '../utils.js';

describe('utils', () => {
  it('normalizeChordQuality aliases', () => {
    expect(normalizeChordQuality('')).toBe('');
    expect(normalizeChordQuality('major')).toBe('maj');
    expect(normalizeChordQuality('min')).toBe('m');
    expect(normalizeChordQuality('M7')).toBe('maj7');
  });

  it('stripVelocity extracts velocity', () => {
    expect(stripVelocity('C4:70')).toEqual({ body: 'C4', velocity: 70 });
    expect(stripVelocity('C4')).toEqual({ body: 'C4', velocity: 90 });
  });

  it('stripRepeat extracts repeat', () => {
    expect(stripRepeat('| C4 *3')).toEqual({ line: '| C4', repeatCount: 3 });
    expect(stripRepeat('| C4')).toEqual({ line: '| C4', repeatCount: 1 });
  });
});
