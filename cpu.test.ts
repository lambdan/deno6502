import { assertEquals } from "jsr:@std/assert";
import { CPU } from "./cpu.ts";

Deno.test("LDA Immediate", () => {
  const cpu = new CPU();
  cpu.loadProgram("0xa9 0x02"); // LDA #$02
  cpu.run();
  assertEquals(cpu.A, 0x02);
});

Deno.test("ADC Immediate", () => {
  const c = new CPU();
  c.loadProgram("0xa9 0x02 0x69 0x02"); // LDA #$02, ADC #$02
  c.run();
  assertEquals(c.A, 0x04);

  c.reset();
  c.loadProgram("a9 02 ea 69 ff"); // lda 2, nop, adc 0xff
  c.run();
  // match https://www.masswerk.at/6502/
  assertEquals(c.A, 0x01);
  // nvdizc
  // 000101
  assertEquals(c.N, 0);
  assertEquals(c.V, 0);
  assertEquals(c.Z, 0);
  assertEquals(c.C, 1);
});

Deno.test("NOP", () => {
  const cpu = new CPU();
  cpu.loadProgram("0xea"); // NOP
  cpu.run();

  assertEquals(cpu.cycles, 2);
});

Deno.test("CMP", () => {
  const cpu = new CPU();
  // A == M
  cpu.loadProgram("A9 02 C9 02");
  cpu.run();
  assertEquals(cpu.Z, 1);
  assertEquals(cpu.C, 1);
  assertEquals(cpu.N, 0);

  // A != M

  cpu.reset(true);
  cpu.loadProgram("A9 02 C9 03");
  cpu.run();
  assertEquals(cpu.Z, 0);
  assertEquals(cpu.C, 0);
  assertEquals(cpu.N, 1);

  // A > M
  cpu.reset(true);
  cpu.loadProgram("a9 ff c9 aa");
  cpu.run();
  assertEquals(cpu.Z, 0);
  assertEquals(cpu.C, 1);
  assertEquals(cpu.N, 0);

  cpu.reset(true);
  cpu.loadProgram("a9 ff c9 01");
  cpu.run();
  assertEquals(cpu.N, 1);
  assertEquals(cpu.Z, 0);
  assertEquals(cpu.C, 1);
});

Deno.test("STA, INC, BCC (while loop)", () => {
  const cpu = new CPU();

  /*
    a = 0
    while a < 10:
        a += 1
    */
  cpu.loadProgram([
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
  ]);
  cpu.run();

  assertEquals(cpu.A, 0x0a, "A should be 10");
  assertEquals(cpu.Z, 1);
  assertEquals(cpu.C, 1);
});
