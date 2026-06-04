import { expandChordSymbol, NOTE_TO_SEMITONE } from "./chords.js";
import { Song, NoteEvent } from "./types.js";

export function parseTmidi(source: string): Song {
    const events: NoteEvent[] = [];
    const sections = new Map<string, NoteEvent[]>();
    const sectionOrder: string[] = [];

    let tempo = 120;
    let grid = "1/16";
    let time = "4/4";

    let currentTrack = "default";
    let currentTrackStep = "1/16";
    let currentTrackNote: string | undefined;
    let currentSection: string | undefined;
    let step = 0;
    let arrangement: string[] | undefined;

    let previousChordVoicing: string[] | undefined;

    for (const rawLine of source.split("\n")) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;

        if (line.startsWith("tempo:")) {
            tempo = Number(line.split(":")[1].trim());
            continue;
        }

        if (line.startsWith("grid:")) {
            grid = line.split(":")[1].trim();
            continue;
        }

        if (line.startsWith("time:")) {
            time = line.split(":")[1].trim();
            continue;
        }

        if (line.startsWith("section:")) {
            currentSection = line.split(":")[1].trim();

            if (!sections.has(currentSection)) {
                sections.set(currentSection, []);
                sectionOrder.push(currentSection);
            }

            step = 0;
            previousChordVoicing = undefined;
            continue;
        }

        if (line.startsWith("track:")) {
            const parts = line.split(/\s+/);

            currentTrack = parts[1];
            currentTrackStep = grid;
            currentTrackNote = undefined;

            step = 0;
            previousChordVoicing = undefined;

            for (const part of parts.slice(2)) {
                const [key, value] = part.split(":");

                if (key === "step") {
                    currentTrackStep = value;
                }

                if (key === "note") {
                    currentTrackNote = value;
                }
            }

            continue;
        }

        if (line.startsWith("play:")) {
            arrangement = line
                .slice("play:".length)
                .trim()
                .split(/\s+/);

            continue;
        }

        if (line.startsWith("|")) {
            const repeatMatch = line.match(/\s+\*(\d+)\s*$/);
            const repeatCount = repeatMatch ? Number(repeatMatch[1]) : 1;
            const barLine = repeatMatch
                ? line.replace(/\s+\*\d+\s*$/, "").trim()
                : line;

            const cells = barLine
                .split("|")
                .map(c => c.trim())
                .filter(Boolean);

            const stepSize = resolutionToGridSteps(currentTrackStep, grid);

            for (let repeat = 0; repeat < repeatCount; repeat++) {
                for (const cell of cells) {
                    const eventTrack = currentTrack;

                    const parsed = parseCell(
                        cell,
                        eventTrack,
                        step,
                        stepSize,
                        previousChordVoicing,
                        currentTrackNote
                    );

                    if (currentSection) {
                        sections.get(currentSection)!.push(...parsed.events);
                    } else {
                        events.push(...parsed.events);
                    }

                    if (parsed.chordVoicing) {
                        previousChordVoicing = parsed.chordVoicing;
                    }

                    step += stepSize;
                }
            }

            continue;
        }
    }

    if (arrangement) {
        return {
            tempo,
            grid,
            time,
            events: arrangeSections(sections, arrangement)
        };
    }

    if (sectionOrder.length > 0) {
        return {
            tempo,
            grid,
            time,
            events: arrangeSections(sections, sectionOrder)
        };
    }

    return { tempo, grid, time, events };
}

function parseCell(
    cell: string,
    track: string,
    step: number,
    durationSteps: number,
    previousChordVoicing?: string[],
    defaultNote?: string
): { events: NoteEvent[]; chordVoicing?: string[] } {
    if (cell === "-") return { events: [] };

    if (cell === "x" || cell === "X" || cell === "!") {
        if (!defaultNote) {
            throw new Error(
                `Track "${track}" uses ${cell} but has no note: configured`
            );
        }

        const velocityMap: Record<string, number> = {
            x: 55,
            X: 75,
            "!": 90
        };

        return {
            events: [{
                track,
                pitch: defaultNote,
                velocity: velocityMap[cell],
                startStep: step,
                durationSteps
            }]
        };
    }

    const velocityMatch = cell.match(/:(\d+)$/);
    const velocity = velocityMatch ? Number(velocityMatch[1]) : 90;
    const body = cell.replace(/:\d+$/, "");

    if (
        (body.startsWith("(") && body.endsWith(")")) ||
        (body.startsWith("[") && body.endsWith("]"))
    ) {
        const pitches = body.slice(1, -1).trim().split(/\s+/);

        return {
            events: pitches.map(pitch => ({
                track,
                pitch,
                velocity,
                startStep: step,
                durationSteps
            })),
            chordVoicing: pitches
        };
    }

    const isNoteName = /^[A-G](?:#|b)?(?:-1|[0-6])$/.test(body);

    if (isNoteName) {
        return {
            events: [{
                track,
                pitch: body,
                velocity,
                startStep: step,
                durationSteps
            }]
        };
    }

    const chordNotes = expandChordSymbol(body, previousChordVoicing);

    if (chordNotes) {
        return {
            events: chordNotes.map(pitch => ({
                track,
                pitch,
                velocity,
                startStep: step,
                durationSteps
            })),
            chordVoicing: chordNotes
        };
    }

    return {
        events: [
            {
                track,
                pitch: body,
                velocity,
                startStep: step,
                durationSteps
            }
        ]
    };
}

function resolutionToGridSteps(resolution: string, grid: string): number {
    const res = fractionToNumber(resolution);
    const gridValue = fractionToNumber(grid);

    const steps = res / gridValue;

    if (!Number.isInteger(steps)) {
        throw new Error(
            `Track step "${resolution}" must divide evenly into grid "${grid}"`
        );
    }

    return steps;
}

function fractionToNumber(value: string): number {
    const [top, bottom] = value.split("/").map(Number);

    if (!top || !bottom) {
        throw new Error(`Invalid fraction: ${value}`);
    }

    return top / bottom;
}

function arrangeSections(
    sections: Map<string, NoteEvent[]>,
    order: string[]
): NoteEvent[] {
    const arrangedEvents: NoteEvent[] = [];
    let offset = 0;

    for (const sectionName of order) {
        const sectionEvents = sections.get(sectionName);

        if (!sectionEvents) {
            throw new Error(`Unknown section: ${sectionName}`);
        }

        for (const event of sectionEvents) {
            arrangedEvents.push({
                ...event,
                startStep: event.startStep + offset
            });
        }

        const sectionLength = Math.max(
            ...sectionEvents.map(event => event.startStep + event.durationSteps),
            0
        );

        offset += sectionLength;
    }

    return arrangedEvents;
}