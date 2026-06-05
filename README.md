# TMIDI

> Composition is not dead.

TMIDI is a plain-text music composition language that compiles to MIDI.

Instead of drawing notes in a piano roll, music is written as text. Tracks, chords, melodies, drums, sections, and arrangements can be assembled in simple `.tmidi` files and compiled into standard MIDI files for use in Ableton, Logic, FL Studio, Reaper, Bitwig, Cubase, or any DAW that supports MIDI.

The goal is not to replace your DAW.

The goal is to make composition portable, readable, versionable, and easy to generate.

---

# Why TMIDI?

Most music software focuses on editing notes visually.

TMIDI approaches composition from the opposite direction:

- Music is readable
- Music is version controlled
- Music is easy to diff
- Music is AI-friendly
- Music is easy to generate
- Music is easy to review

```text
track: pad step:1/1

| Cmaj7 | Am7 | Fmaj7 | G7 |
```

A few lines of text become a complete MIDI arrangement.

---

# Features

## Composition

- Plain text notation
- Multiple tracks
- Notes
- Chords
- Explicit voicings
- Voice leading
- Slash chords
- Repeats
- Sections
- Song arrangements

## Rhythm

- Independent track resolutions
- Long pad chords
- Fast melodies
- Drum programming
- Velocity shorthand

## MIDI

- MIDI export
- MIDI inspection
- Human-readable MIDI output

---

# Installation

Pull the repo and install dependencies:

```bash
npm install
```

---

# Getting started

The easiest way to get started is probably casting your eye over the example file provided, learn the notation, run the commands below to convert it to midi.


Full example [here](https://github.com/chrissysemens/tMidi/blob/main/examples/example.tmidi)

One you have a midi file, drag it into the daw of your choice. 
Add instruments to each track. Have fun.

You can listen to the track composed with the example midi [here](https://github.com/chrissysemens/tMidi/blob/main/final/example.wav)

Don't judge the music it's just a demo 😀


# Command Guide

## Build a MIDI file

```bash
npm run dev -- build song.tmidi -o song.mid
```

Example:

```bash
npm run dev -- build examples/basic.tmidi -o basic.mid
```

---

## Inspect a MIDI file

```bash
npm run dev -- inspect song.mid
```

Example output:

```text
Tempo: 120
Tracks: 1

Track 1: pad
  time=0.000s dur=2.000s  C4:90 E4:90 G4:90
```

---

## Typical Workflow

Write:

```text
tempo: 120
grid: 1/16

track: pad step:1/1
| C | Am | F | G |
```

Build:

```bash
npm run dev -- build song.tmidi -o song.mid
```

Inspect:

```bash
npm run dev -- inspect song.mid
```

Import into your DAW.

---

# Language Reference

## Tempo

```text
tempo: 120
```

---

## Grid

Defines the base timing resolution.

```text
grid: 1/16
```

Examples:

```text
grid: 1/4
grid: 1/8
grid: 1/16
grid: 1/32
```

---

## Time Signature

```text
time: 4/4
```

Examples:

```text
time: 4/4
time: 3/4
time: 6/8
```

---

# Tracks

Tracks contain musical events.

```text
track: piano
```

Tracks may define their own step resolution.

```text
track: pad step:1/1
track: melody step:1/16
```

This allows:

- Long sustained pads
- Fast melodies
- Detailed drum programming

within the same composition.

---

# Notes

Individual notes:

```text
| C4 | D4 | E4 | F4 |
```

Accidentals:

```text
| F#4 | Bb4 |
```

---

# Chords

Root-position chord symbols:

```text
| C | Am | F | G |
```

Supported examples:

```text
C
Cm

C7
Cm7
Cmaj7

Csus2
Csus4

Cdim
Caug

Cadd9
```

---

# Explicit Voicings

You dont have to use chord names, you can build your own chords with exact notes:

```text
| [C4 E4 G4] |
```

or

```text
| (C4 E4 G4) |
```

---

# Voice Leading

TMIDI automatically attempts to choose nearby voicings.

```text
| C | Dm | Em | F |
```

Instead of jumping around the keyboard, chords are voiced to minimize movement.

---

# Slash Chords

Specify a bass note.

```text
| C/E | G/B | Am/C |
```

Examples:

```text
C/E
```

C major with E in the bass.

```text
G/B
```

G major with B in the bass.

---

# Repeats

Repeat a pattern.

```text
| C | Am | F | G | *4
```

Equivalent to writing the progression four times.

---

# Drums

Drums are typically represented using separate tracks.

```text
track: kick step:1/16 note:C1
track: snare step:1/16 note:C1
track: hat step:1/16 note:C1
```

Example:

```text
track: kick step:1/16 note:C1
| X | - | - | - | X | - | - | - |
```

---

# Velocity Shorthand
Drum tracks have a velocity short hand X | x | !

Ghost note:

```text
x
```

Velocity:

```text
55
```

Normal hit:

```text
X
```

Velocity:

```text
75
```

Accent:

```text
!
```

Velocity:

```text
90
```

Example:

```text
| X | x | X | ! |
```

---

# Sections

Group musical ideas together.

```text
section: verse

track: pad step:1/1
| C | Am | F | G |

section: chorus

track: pad step:1/1
| F | G | Em | Am |
```

If no arrangement is defined, sections are played in the order they appear.

---

# Arrangements

Arrange sections into complete songs.

```text
play: verse verse chorus verse
```

Example:

```text
section: verse

track: pad step:1/1
| C | Am | F | G |

section: chorus

track: pad step:1/1
| F | G | Em | Am |

play: verse verse chorus verse
```

---

# Complete Example

```text
tempo: 120
grid: 1/16
time: 4/4

section: verse

track: pad step:1/1
| Cmaj7 | Am7 | Fmaj7 | G7 |

track: melody step:1/16
| C5 | - | E5 | - | G5 | - | E5 | - |

track: kick step:1/16 note:C1
| X | - | - | - | X | - | - | - |

track: snare step:1/16 note:C1
| - | - | - | - | X | - | - | - |

track: hat step:1/16 note:C1
| X | x | X | x | X | x | ! | x |

play: verse verse chorus verse
```

---

# Roadmap

Planned features:

- Swing
- Humanization
- MIDI → TMIDI conversion
- Arpeggiators
- Generative patterns
- Degree-based harmony (I–V–vi–IV)
- Automation and CC support

---

# Philosophy

TMIDI is intentionally simple.

Music should be readable.

Music should be version controlled.

Music should be generated by humans and machines.

Composition is not dead.
