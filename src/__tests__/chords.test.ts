import { describe, it, expect } from 'vitest';
import { noteNameToMidi, midiToNoteName, expandChordSymbol } from '../chords.js';

describe('chords', () => {
  it('noteNameToMidi and midiToNoteName roundtrip', () => {
    expect(noteNameToMidi('C4')).toBe(60);
    expect(midiToNoteName(60)).toBe('C4');
    expect(noteNameToMidi('A4')).toBe(69);
    expect(midiToNoteName(69)).toBe('A4');
  });

  it('expand simple chord symbols', () => {
    const notes = expandChordSymbol('C');
    expect(notes).not.toBeNull();
    expect(notes).toContain('C4');
    expect(notes).toContain('E4');
    expect(notes).toContain('G4');
  });

  it('expand slash chord with bass', () => {
    const notes = expandChordSymbol('C/G@3');
    expect(notes).not.toBeNull();
    // bass should be lower than others
    expect(notes![0]).toMatch(/^G[0-9]+$/);
  });

  it('returns null for invalid symbol', () => {
    expect(expandChordSymbol('Zbad')).toBeNull();
  });
});
