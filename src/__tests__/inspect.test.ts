import { describe, it, expect, vi } from 'vitest';

vi.mock('@tonejs/midi', () => {
  class MockMidi {
    header = { tempos: [{ bpm: 100 }] };
    tracks = [ { name: 't1', notes: [ { time: 0.0, name: 'C4', velocity: 0.5, duration: 0.25 } ] } ];
    constructor(data?: any) {}
  }
  return { default: { Midi: MockMidi } };
});

vi.mock('node:fs', () => {
  const promises = { readFile: vi.fn().mockResolvedValue(Buffer.from([1,2,3])) };
  return { default: { promises }, promises };
});

import { inspectMidi } from '../inspect.js';
import fs from 'node:fs';

describe('inspect', () => {
  it('prints summary for midi file', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await inspectMidi('/tmp/fake.mid');

    expect((fs as any).promises.readFile).toHaveBeenCalled();
    expect(log).toHaveBeenCalled();

    log.mockRestore();
  });
});
