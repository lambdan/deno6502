import { CPU } from "./cpu.ts";

const c = new CPU(true);

c.loadProgram(
  [
    0xa9, // LDA
    0x02, // 2
    0xea, // NOP
    0x69, // ADC
    0x02, // 2
  ],
  0x00
);
c.run(0x00);
await Deno.writeFile("mem.bin", new Uint8Array(c.mem));

/*
console.log("cycles\tPC\tA");
while (true) {
  console.log(`${c.cycles}\t${c.PC.toString(16)}\t${c.A.toString(16)}`);
  c.exec();
  //if (c.cycles > 10) break;
}
*/
