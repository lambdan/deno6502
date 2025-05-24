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
