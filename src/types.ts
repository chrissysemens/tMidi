export type NoteEvent = {
  track: string;
  pitch: string;
  velocity: number;
  startStep: number;
  durationSteps: number;
};

export type TrackState = {
  name: string;
  step: string;
};

export type TrackMeta = {
  color?: string;
};

export type Song = {
  tempo: number;
  grid: string;
  time: string;
  events: NoteEvent[];
  tracks?: Record<string, TrackMeta>;
};