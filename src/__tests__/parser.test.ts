import { describe, it, expect } from 'vitest';
import { parseTmidi } from '../parser.js';

const simple = `
# simple example
tempo: 100
| C4 | D4 | E4 |
`;

describe('parser', () => {
  it('parses simple sequence and tempo', () => {
    const song = parseTmidi(simple);
    expect(song.tempo).toBe(100);
    expect(song.events.length).toBeGreaterThan(0);
    expect(song.events[0].pitch).toBe('C4');
  });

  it('parses sections and arrangements', () => {
    const src = `
section: A
| C4 | D4 |
section: B
| E4 | F4 |
play: A B
`;
    const song = parseTmidi(src);
    expect(song.events.length).toBe(4);
    expect(song.events[0].pitch).toBe('C4');
    expect(song.events[2].pitch).toBe('E4');
  });
});
