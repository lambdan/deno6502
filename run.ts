import { CPU } from "./cpu.ts";

const c = new CPU();

c.reset(0x00);

c.write(0x00, 0xa9); // LDA
c.write(0x01, 0x02); // Immediate value 2
c.write(0x02, 0xea); // NOP
c.write(0x03, 0x69); // ADC
c.write(0x04, 0x02); // Add 2?

console.log("cycles\tPC\tA");
while (true) {
  console.log(`${c.cycles}\t${c.PC.toString(16)}\t${c.A.toString(16)}`);
  c.exec();
  //if (c.cycles > 10) break;
}
