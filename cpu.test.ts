import { assertEquals } from "jsr:@std/assert";
import { CPU } from "./cpu.ts";

Deno.test("CPU read", () => {
  const cpu = new CPU();
  cpu.mem[0x200] = 0x42;
  assertEquals(cpu.read(0x200), 0x42);
});

Deno.test("CPU write", () => {
  const cpu = new CPU();
  cpu.write(0x200, 0x42);
  assertEquals(cpu.mem[0x200], 0x42);
});

Deno.test("LDA Immediate", () => {
  const cpu = new CPU();
  cpu.reset(0x00);

  cpu.write(0x00, 0xa9); // LDA
  cpu.write(0x01, 0x02); // Immediate value 2

  cpu.exec();

  assertEquals(cpu.A, 0x02);
});

Deno.test("ADC Immediate", () => {
  const c = new CPU();
  c.reset();

  c.write(0x00, 0xa9); // LDA
  c.write(0x01, 0x02); // Immediate value 2
  c.write(0x02, 0x69); // ADC
  c.write(0x03, 0x02); // Add 2?

  c.exec();
  c.exec();

  assertEquals(c.A, 0x04);
});

Deno.test("NOP", () => {
  const cpu = new CPU();
  cpu.reset(0x00);

  cpu.write(0x00, 0xea); // NOP

  cpu.exec();

  assertEquals(cpu.cycles, 2);
});
