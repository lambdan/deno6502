export class CPU {
  /** Accumulator */
  A = 0;
  /**  X register*/
  X = 0;
  /** Y register*/
  Y = 0;
  /** Stack Pointer */
  SP = 0;
  /** Program Counter */
  PC = 0;

  /** Status Register: N - Negative */
  N = false;
  /** Status Register: V: Overflow */
  V = false;
  /** Status Register: B: Break */
  B = false;
  /** Status register: D: Decimal */
  D = false;
  /** Status Register Interrupt Disable */
  I = false;
  /** Status Register Zero */
  Z = false;
  /** Status Register Carry */
  C = false;

  mem: number[] = new Array(64 * 1024);

  /** How many cycles the CPU has done */
  cycles = 0;

  constructor() {
    this.reset();
  }

  /** "Resets" CPU. Parameter to set PC address */
  reset(PC = 0x00) {
    this.PC = PC;
    this.A = 0;
    this.X = 0;
    this.Y = 0;
    this.SP = 0xfd;
    this.N = false;
    this.V = false;
    this.B = false;
    this.D = false;
    this.I = false;
    this.Z = false;
    this.C = false;
    this.cycles = 0;

    // Iniitalize 64 KB of memory
    for (let i = 0; i < 1024 * 64; i++) {
      this.mem[i] = 0x00;
    }
    //console.log("CPU reset");
  }

  /** Read and increment PC */
  fetchPC(): number {
    return this.read(this.PC++);
  }

  read(addr: number) {
    if (addr < 0 || addr >= this.mem.length) {
      throw new Error(`Memory read out of bounds: ${addr}`);
    }
    return this.mem[addr];
  }

  write(addr: number, val: number) {
    if (addr < 0 || addr >= this.mem.length) {
      throw new Error(`Memory write out of bounds: ${addr}`);
    }
    this.mem[addr] = val & 0xff;
  }

  /** Execute PC */
  exec() {
    const op = this.fetchPC();
    switch (op) {
      case 0xa9: // LDA Immediate
        this.OP_LDA_Immediate();
        break;
      case 0xea: // NOP
        this.OP_NOP();
        break;
      case 0x69: // ADC immediate
        this.OP_ADC_Immediate();
        break;
      default:
        throw new Error(`Unimplemented OP ${op.toString(16)}`);
    }
  }

  /**
   * A,Z,N = M
   * Loads a byte of memory into the accumulator setting the zero and negative flags as appropriate.
   */
  OP_LDA_Immediate() {
    this.A = this.fetchPC();
    this.cycles += 1;
    this.Z = this.A === 0;
    this.N = (this.A & 0x80) !== 0;
    this.cycles += 2;
  }

  /**
   * The NOP instruction causes no changes to the processor other than the normal incrementing of the program counter to the next instruction.
   */
  OP_NOP() {
    this.cycles += 2;
  }

  /**
   * A,Z,C,N = A+M+C
   *
   * This instruction adds the contents of a memory location to the accumulator together with the carry bit.
   * If overflow occurs the carry bit is set, this enables multiple byte addition to be performed.
   */
  OP_ADC_Immediate() {
    const val = this.fetchPC();
    const result = this.A + val + (this.C ? 1 : 0);
    this.A = result & 0xff;
    this.Z = (result & 0xff) === 0;
    this.C = result > 0xff;
    this.N = (result & 0x80) !== 0;
    this.cycles += 2;
  }
}
