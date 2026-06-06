import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";

import { parseTmidi } from "./parser.js";
import { writeMidi } from "./midi.js";
import { inspectMidi } from "./inspect.js";
import { visualizeSong } from "./visualise.js";

const program = new Command();

let pkgVersion = "0.0.0";
try {
    const pkgRaw = fs.readFileSync(new URL("../package.json", import.meta.url), "utf8");
    const pkg = JSON.parse(pkgRaw);
    pkgVersion = pkg.version ?? pkgVersion;
} catch { }

program.name("text-to-midi").version(pkgVersion).description("Text-to-MIDI utilities");

program
    .command("build")
    .description("Build a MIDI file from a .tmidi source")
    .argument("<input>")
    .option("-o, --out <path>", "output MIDI", "output.mid")
    .action(async (input, options) => {
        try {
            let source: string;

            if (input === "-") {
                source = await new Promise((resolve) => {
                    let data = "";
                    process.stdin.setEncoding("utf8");
                    process.stdin.on("data", (chunk) => (data += chunk));
                    process.stdin.on("end", () => resolve(data));
                    process.stdin.resume();
                });
            } else {
                source = await fs.promises.readFile(input, "utf8");
            }

            const song = parseTmidi(source);

            // ensure output directory exists
            const outDir = path.dirname(options.out);
            if (outDir && outDir !== ".") {
                await fs.promises.mkdir(outDir, { recursive: true });
            }

            await writeMidi(song, options.out);

            console.log(`Wrote ${options.out}`);
        } catch (err: any) {
            console.error("Build failed:", err?.message ?? err);
            process.exit(1);
        }
    });

program
    .command("inspect")
    .description("Inspect a MIDI file and print summary to stdout")
    .argument("<input>")
    .action(async (input) => {
        try {
            if (input === "-") {
                console.error("inspect does not support stdin input");
                process.exit(2);
            }

            await inspectMidi(input);
        } catch (err: any) {
            console.error("Inspect failed:", err?.message ?? err);
            process.exit(1);
        }
    });

program
    .command("visualise")
    .argument("<input>")
    .action((input) => {
        const source = fs.readFileSync(input, "utf8");
        const song = parseTmidi(source);

        visualizeSong(song);
    });
program.parse();