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
c.reset();
c.loadProgram(
  [
    0xa9, // LDA
    0x00, // 00 (load A with 0)
    0x85, // STA
    0xff, // FF (store A in FF)
    0xe6, // INC
    0xff, // FF (increment FF by 1)
    0xa5, // LDA
    0xff, // FF (load A with FF)
    0xc9, // CMP
    0x0a, // 10 (is A == 10?)
    0x90, // BCC
    0xf6, // -8 (go back 8 instructions, to the INC)
  ],
  0xaa
);
c.run(0xaa);
await Deno.writeFile("mem.bin", new Uint8Array(c.mem));

/*
console.log("cycles\tPC\tA");
while (true) {
  console.log(`${c.cycles}\t${c.PC.toString(16)}\t${c.A.toString(16)}`);
  c.exec();
  //if (c.cycles > 10) break;
}
*/
