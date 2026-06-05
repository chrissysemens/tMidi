import { normalizeChordQuality } from "./utils.js";
import { TMIDI_REGEX } from "./consts.js";

export const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export const SEMITONE_TO_NOTE = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const CHORD_QUALITIES: Record<string, number[]> = {
  "": [0, 4, 7],
  maj: [0, 4, 7],
  m: [0, 3, 7],
  min: [0, 3, 7],

  dim: [0, 3, 6],
  aug: [0, 4, 8],

  "5": [0, 7],

  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],

  "7": [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  M7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  min7: [0, 3, 7, 10],
  dim7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10],

  sus2: [0, 2, 7],
  sus4: [0, 5, 7],

  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14],

  "9": [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  M9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  min9: [0, 3, 7, 10, 14],
};

const chooseClosestVoicing = (
  basicVoicing: number[],
  previousVoicing: number[],
  previousCenter?: number
): number[] => {
  if (basicVoicing.length === 0) return [];
  if (!previousVoicing || previousVoicing.length === 0) return basicVoicing;

  const candidates = generateInversionCandidates(basicVoicing);

  let best = candidates[0];
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const score = voiceLeadingScore(candidate, previousVoicing, previousCenter);

    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}

const generateInversionCandidates = (basicVoicing: number[]): number[][] => {
  const candidates: number[][] = [];

  for (let octaveShift = -1; octaveShift <= 1; octaveShift++) {
    const shifted = basicVoicing.map(n => n + octaveShift * 12);

    for (let inversion = 0; inversion < shifted.length; inversion++) {
      const candidate = [...shifted];

      for (let i = 0; i < inversion; i++) {
        candidate[i] += 12;
      }

      candidates.push(candidate.sort((a, b) => a - b));
    }
  }

  return candidates;
}

const voiceLeadingScore = (
  candidate: number[],
  previous: number[],
  previousCenter?: number
): number => {
  const len = Math.min(candidate.length, previous.length);

  let score = 0;

  for (let i = 0; i < len; i++) {
    score += Math.abs(candidate[i] - previous[i]);
  }

  // Penalize huge register jumps.
  const candidateCenter = average(candidate);
  const prevCenter = previousCenter ?? average(previous);
  score += Math.abs(candidateCenter - prevCenter) * 0.5;

  return score;
}

const average = (nums: number[]): number => {
  if (nums.length === 0) return 0;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

export const noteNameToMidi = (note: string): number => {
  const match = note.match(TMIDI_REGEX.noteWithAnyOctave);
  if (!match) throw new Error(`Invalid note name: ${note}`);

  const [, pitch, octaveText] = match;
  const semitone = NOTE_TO_SEMITONE[pitch];

  if (semitone === undefined) {
    throw new Error(`Invalid pitch: ${pitch}`);
  }

  return 12 * (Number(octaveText) + 1) + semitone;
}

export const midiToNoteName = (midi: number): string => {
  const semitone = midi % 12;
  const octave = Math.floor(midi / 12) - 1;

  return `${SEMITONE_TO_NOTE[semitone]}${octave}`;
}

/**
 * Expand a chord symbol (e.g. Cmaj7/G@4) into absolute note names.
 * Returns `null` if the symbol is invalid.
 */
export const expandChordSymbol = (
  symbol: string,
  previousVoicing?: string[]
): string[] | null => {
  const match = symbol.match(TMIDI_REGEX.chordSymbol);

  if (!match) return null;

  const [, root, rawQuality, bassNote, octaveText] = match;

  const quality = normalizeChordQuality(rawQuality);
  const rootSemitone = NOTE_TO_SEMITONE[root];
  const intervals = CHORD_QUALITIES[quality];

  if (rootSemitone === undefined || !intervals) return null;

  const rootOctave =
    octaveText !== undefined
      ? Number(octaveText)
      : root === "C"
        ? 4
        : rootSemitone < NOTE_TO_SEMITONE.C
          ? 4
          : 3;

  const rootMidi = 12 * (rootOctave + 1) + rootSemitone;
  const basicVoicing = intervals.map(interval => rootMidi + interval);

  let finalVoicing: number[];

  if (octaveText !== undefined || !previousVoicing?.length) {
    finalVoicing = basicVoicing;
  } else {
    const previousMidi = previousVoicing.map(noteNameToMidi);
    // compute previous center once for efficiency
    const previousCenter = average(previousMidi);
    finalVoicing = chooseClosestVoicing(basicVoicing, previousMidi, previousCenter);
  }

  if (bassNote) {
    const bassSemitone = NOTE_TO_SEMITONE[bassNote];

    if (bassSemitone === undefined) {
      return null;
    }

    const bassMidi = bassMidiBelowVoicing(bassNote, finalVoicing);

    finalVoicing = [
      bassMidi,
      ...finalVoicing.filter(note => note % 12 !== bassSemitone)
    ].sort((a, b) => a - b);
  }

  return finalVoicing.map(midiToNoteName);
}

const bassMidiBelowVoicing = (
  bassNote: string,
  voicing: number[]
): number => {
  const bassSemitone = NOTE_TO_SEMITONE[bassNote];

  if (bassSemitone === undefined) {
    throw new Error(`Invalid slash chord bass note: ${bassNote}`);
  }

  const lowest = Math.min(...voicing);

  let bassMidi = 12 * (Math.floor(lowest / 12) + 1) + bassSemitone;

  while (bassMidi >= lowest) {
    bassMidi -= 12;
  }

  return bassMidi;
}