import { NoteEvent, Song } from "./types.js";

const COLORS: Record<string, string> = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  purple: "\x1b[35m",
  cyan: "\x1b[36m",
  teal: "\x1b[36m",
  teale: "\x1b[36m",
  orange: "\x1b[38;5;208m",
  pink: "\x1b[38;5;205m",
  brown: "\x1b[38;5;130m",
  white: "\x1b[37m",
  lightgrey: "\x1b[37m",
  gray: "\x1b[90m",
  grey: "\x1b[90m",
};

const RESET = "\x1b[0m";

export const visualizeSong = (song: Song): void => {
  const tracks = [...new Set(song.events.map(event => event.track))];

  console.log(song.tracks);

  const maxStep = Math.max(
    ...song.events.map(event => event.startStep + event.durationSteps),
    0
  );

  const maxColumns = 96;
  const scale = Math.max(1, Math.ceil(maxStep / maxColumns));
  const width = Math.ceil(maxStep / scale);

  console.log("");
  console.log(`tempo: ${song.tempo}  grid: ${song.grid}  time: ${song.time}`);
  console.log(`scale: 1 char = ${scale} step(s)`);
  console.log("");

  console.log(`steps  ${renderStepHeader(width, scale)}`);

  for (const track of tracks) {
    const events = song.events.filter(event => event.track === track);
    const color = song.tracks?.[track]?.color;
    const line = renderTrackLine(events, width, scale);

    console.log(`${pad(track, 6)} ${paint(line, color)}`);
  }

  console.log("");
};

const renderTrackLine = (
  events: NoteEvent[],
  width: number,
  scale: number
): string => {
  const cells = Array.from({ length: width }, () => "·");

  for (const event of events) {
    const start = Math.floor(event.startStep / scale);
    const end = Math.ceil((event.startStep + event.durationSteps) / scale);

    for (let index = start; index < end; index++) {
      if (index >= 0 && index < cells.length) {
        cells[index] = index === start ? "█" : "━";
      }
    }
  }

  return cells.join("");
};

const renderStepHeader = (width: number, scale: number): string => {
  return Array.from({ length: width }, (_, index) => {
    const step = index * scale;

    return step % 16 === 0 ? "|" : step % 4 === 0 ? ":" : " ";
  }).join("");
};

const paint = (text: string, color?: string): string => {
  if (!color) return text;

  const code = COLORS[color.toLowerCase()];
  if (!code) return text;

  return `${code}${text}${RESET}`;
};

const pad = (text: string, length: number): string => {
  return text.length >= length
    ? text.slice(0, length)
    : text.padEnd(length, " ");
};