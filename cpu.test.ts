import { assertEquals } from "jsr:@std/assert";
import { CPU } from "./cpu.ts";

Deno.test("CPU reset", () => {
  const cpu = new CPU();
  cpu.reset();
  assertEquals(cpu.SP, 0xfd);
});

Deno.test("LDA", () => {
  const cpu = new CPU();

  // Value 2
  cpu.reset();
  cpu.write(1, 2);
  cpu.LDA(1);
  assertEquals(cpu.A, 2, "A should now be 2");
  assertEquals(cpu.Z, false, "A is not zero");

  cpu.reset();
  cpu.write(1, 0);
  cpu.LDA(1);
  assertEquals(cpu.A, 0, "A is now 0");
  assertEquals(cpu.Z, true, "Zero flag should be on");
});

Deno.test("STA", () => {
  const cpu = new CPU();
  cpu.reset();

  cpu.write(1, 2);
  cpu.LDA(1);
  cpu.STA(3);
  assertEquals(cpu.mem[3], 2);
});
