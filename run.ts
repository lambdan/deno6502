import { CPU } from "./cpu.ts";

const args = Deno.args;
if (args.length < 1) {
  console.error("Usage: deno run --allow-read run.ts <6502-bin-or-string>");
  console.error("Example: deno run --allow-read run.ts program.bin");
  console.error("Or: deno run --allow-read run.ts '0xa9 0x02 0xea 0x69 0x02'");
  Deno.exit(1);
}

let prog: number[] = [];

const file = args[0];
try {
  // try reading $1 as a file path
  const data = await Deno.readFile(file);
  for (const b of data) {
    prog.push(b & 0xff);
  }
} catch (_e) {
  // if reading file fails, assume it's a space-separated string of hex values
  prog = args[0]
    .trim()
    .split(" ")
    .map((byte) => {
      return +byte.trim();
    });
}

const cpu = new CPU(true);
cpu.loadProgram(prog, 0x00);
cpu.run(0x00);
