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
});

Deno.test("NOP", () => {
  const cpu = new CPU();
  cpu.loadProgram("0xea"); // NOP
  cpu.run();

  assertEquals(cpu.cycles, 2);
});
