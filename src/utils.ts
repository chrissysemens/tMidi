import { NOTE_TO_SEMITONE } from "./chords.js";

export function normalizeChordQuality(quality: string): string {
  const aliases: Record<string, string> = {
    
    "": "",
    major: "maj",
    maj: "maj",
    M: "maj",

    minor: "m",
    min: "m",
    m: "m",

    M7: "maj7",
    major7: "maj7",
    maj7: "maj7",

    minor7: "m7",
    min7: "m7",
    m7: "m7",

    minor9: "m9",
    major9: "maj9",
  };

  return aliases[quality] ?? quality;
}

function chooseClosestVoicing(
  basicVoicing: number[],
  previousVoicing: number[]
): number[] {
  const candidates = generateInversionCandidates(basicVoicing);

  let best = candidates[0];
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const score = voiceLeadingScore(candidate, previousVoicing);

    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}

function generateInversionCandidates(basicVoicing: number[]): number[][] {
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

function voiceLeadingScore(
  candidate: number[],
  previous: number[]
): number {
  const len = Math.min(candidate.length, previous.length);

  let score = 0;

  for (let i = 0; i < len; i++) {
    score += Math.abs(candidate[i] - previous[i]);
  }

  const candidateCenter = average(candidate);
  const previousCenter = average(previous);
  score += Math.abs(candidateCenter - previousCenter) * 0.5;

  return score;
}

function average(nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function noteNameToMidi(note: string): number {
  const match = note.match(/^([A-G](?:#|b)?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note name: ${note}`);

  const [, pitch, octaveText] = match;
  const semitone = NOTE_TO_SEMITONE[pitch];

  if (semitone === undefined) {
    throw new Error(`Invalid pitch: ${pitch}`);
  }

  return 12 * (Number(octaveText) + 1) + semitone;
}