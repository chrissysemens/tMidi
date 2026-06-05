import { TMIDI_REGEX } from "./consts.js";

export const normalizeChordQuality = (quality: string): string => {
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

export const stripVelocity = (cell: string) => {
  const match = cell.match(TMIDI_REGEX.velocitySuffix);

  return {
    body: cell.replace(TMIDI_REGEX.velocitySuffix, ""),
    velocity: match ? Number(match[1]) : 90
  };
};

export const stripRepeat = (line: string) => {
  const match = line.match(TMIDI_REGEX.repeatSuffix);

  return {
    line: match ? line.replace(TMIDI_REGEX.repeatSuffix, "").trim() : line,
    repeatCount: match ? Number(match[1]) : 1
  };
};