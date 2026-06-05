import ToneMidi from "@tonejs/midi";
import { Song } from "./types.js";
import fs from "node:fs";

const shiftPitchOctave = (pitch: string, amount: number): string => {
    return pitch.replace(
        /(-?\d+)$/,
        (_, octave) => String(Number(octave) + amount)
    );
}

export const writeMidi = (song: Song, outPath: string) => {
    const { Midi } = ToneMidi;
    const midi = new Midi();
    midi.header.setTempo(song.tempo);
    midi.header.setTempo(song.tempo);

    const ticksPerQuarter = midi.header.ppq;
    const ticksPerStep = ticksPerQuarter / 4;

    const tracks = new Map<string, ReturnType<typeof midi.addTrack>>();

    for (const event of song.events) {
        if (!tracks.has(event.track)) {
            const track = midi.addTrack();
            track.name = event.track;
            tracks.set(event.track, track);
        }

        if (!/^[A-G](?:#|b)?-?\d+$/.test(event.pitch)) {
            throw new Error(
                `Invalid pitch "${event.pitch}" in track "${event.track}" at step ${event.startStep}`
            );
        }
        tracks.get(event.track)!.addNote({
            name: shiftPitchOctave(event.pitch, 1),
            velocity: event.velocity / 127,
            ticks: event.startStep * ticksPerStep,
            durationTicks: event.durationSteps * ticksPerStep
        });
    }

    fs.writeFileSync(outPath, Buffer.from(midi.toArray()));
}