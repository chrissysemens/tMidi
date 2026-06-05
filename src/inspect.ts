import ToneMidi from "@tonejs/midi";
import fs from "node:fs";
import { TMIDI_REGEX } from "./consts.js";

const { Midi } = ToneMidi;

const displayPitch = (name: string): string => {
  return name.replace(TMIDI_REGEX.noteWithAnyOctave, (_, pitch, octave) => `${pitch}${String(Number(octave) - 1)}`);
}

export const inspectMidi = async (path: string): Promise<void> => {
  const data = await fs.promises.readFile(path);
  const midi = new Midi(data);

  const tempo = midi.header.tempos?.[0]?.bpm ?? "unknown";
  console.log(`Tempo: ${tempo}`);
  console.log(`Tracks: ${midi.tracks.length}`);
  console.log("");

  midi.tracks.forEach((track, trackIndex) => {
    console.log(`Track ${trackIndex + 1}: ${track.name || "(unnamed)"}`);

    const groups = new Map<number, typeof track.notes>();

    for (const note of track.notes) {
      const timeKey = Number(note.time.toFixed(6));

      if (!groups.has(timeKey)) {
        groups.set(timeKey, []);
      }

      groups.get(timeKey)!.push(note);
    }

    [...groups.entries()]
      .sort(([a], [b]) => a - b)
      .forEach(([time, notes]) => {
        const played = notes
          .map(note => `${displayPitch(note.name)}:${Math.round(note.velocity * 127)}`)
          .join(" ");

        const duration = Math.max(...notes.map(note => note.duration));

        console.log(
          `  time=${time.toFixed(3)}s dur=${duration.toFixed(3)}s  ${played}`
        );
      });

    console.log("");
  });
}