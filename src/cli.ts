import fs from "node:fs";
import { Command } from "commander";

import { parseTmidi } from "./parser.js";
import { writeMidi } from "./midi.js";
import { inspectMidi } from "./inspect.js";

const program = new Command();

program
    .command("build")
    .argument("<input>")
    .option("-o, --out <path>", "output MIDI", "output.mid")
    .action((input, options) => {
        const source = fs.readFileSync(input, "utf8");
        const song = parseTmidi(source);

        writeMidi(song, options.out);

        console.log(`Wrote ${options.out}`);
    });

program
    .command("inspect")
    .argument("<input>")
    .action((input) => {
        inspectMidi(input);
    });

program.parse();