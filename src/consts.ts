export const TMIDI_REGEX = {
  noteName: /^[A-G](?:#|b)?(?:-1|[0-6])$/,
  noteWithAnyOctave: /^([A-G](?:#|b)?)(-?\d+)$/,
  chordSymbol: /^([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?(?:@(\d+))?$/,
  velocitySuffix: /:(\d+)$/,
  repeatSuffix: /\s+\*(\d+)\s*$/,
  spaceSlashChord: /^(\S+)\s+([A-G](?:#|b)?)$/,
  pitchOnly: /^[A-G](?:#|b)?$/,
};