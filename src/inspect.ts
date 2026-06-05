import ToneMidi from "@tonejs/midi";
import fs from "node:fs";

const { Midi } = ToneMidi;

const displayPitch = (name: string): string => {
  return name.replace(
    /(-?\d+)$/,
    (_, octave) => String(Number(octave) - 1)
  );
}

export const inspectMidi = (path: string) => {
  const data = fs.readFileSync(path);
  const midi = new Midi(data);

  console.log(`Tempo: ${midi.header.tempos?.[0]?.bpm ?? midi.header.tempos?.[0]?.bpm ?? "unknown"}`);
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