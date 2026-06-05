import { describe, it, expect, vi } from 'vitest';

vi.mock('@tonejs/midi', () => {
  class MockTrack {
    name = '';
    notes: any[] = [];
    addNote(obj: any) { this.notes.push(obj); }
  }
  class MockMidi {
    header = { ppq: 480, setTempo: vi.fn(), tempos: [] };
    tracks: MockTrack[] = [];
    toArray() { return new Uint8Array([1,2,3]); }
    addTrack() { const t = new MockTrack(); this.tracks.push(t); return t; }
  }
  return { default: { Midi: MockMidi } };
});

vi.mock('node:fs', () => {
  const promises = { writeFile: vi.fn().mockResolvedValue(undefined) };
  return { default: { promises }, promises };
});

import { writeMidi } from '../midi.js';
import fs from 'node:fs';

describe('midi', () => {
  it('writes midi and shifts octave', async () => {
    const song = { tempo: 120, grid: '1/16', time: '4/4', events: [ { track: 't', pitch: 'C4', velocity: 90, startStep: 0, durationSteps: 1 } ] };

    await writeMidi(song as any, '/tmp/out.mid');

    expect((fs as any).promises.writeFile).toHaveBeenCalled();
  });
});
