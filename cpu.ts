export class CPU {
  /** Accumulator */
  A: number;
  /**  X register*/
  X: number;
  /** Y register*/
  Y: number;
  /** Stack Pointer */
  SP: number;
  /** Program Counter */
  PC: number;

  /** Status Register: N - Negative */
  N: boolean;
  /** Status Register: V: Overflow */
  V: boolean;
  /** Status Register: B: Break */
  B: boolean;
  /** Status register: D: Decimal */
  D: boolean;
  /** Status Register Interrupt Disable */
  I: boolean;
  /** Status Register Zero */
  Z: boolean;
  /** Status Register Carry */
  C: boolean;

  mem: number[] = new Array(64 * 1024);

  constructor() {
    this.A = 0; // Accumulator
    this.X = 0; // X Register
    this.Y = 0; // Y Register
    this.SP = 0; // Stack Pointer
    this.PC = 0; // Program Counter
    this.N = false;
    this.V = false;
    this.B = false;
    this.D = false;
    this.I = false;
    this.Z = false;
    this.C = false;

    // Iniitalize 64 KB of memory
    for (let i = 0; i < 1024 * 64; i++) {
      this.mem[i] = 0x00;
    }
  }

  reset() {
    this.SP = 0xfd;
    this.I = false;
    this.D = false;
    this.B = false;
    //console.log("CPU reset");
  }

  read(addr: number) {
    return this.mem[addr];
  }

  write(addr: number, val: number) {
    this.mem[addr] = val & 0xff;
  }

  /**
   * Load Accumulator with Memory
   * @param address to load from
   */
  LDA(address: number) {
    // load into A(ccumulator)
    this.A = this.mem[address];
    // set zero flag if A is now 0
    this.Z = this.A === 0;
    // negative flag set if bit 7 of A is set
    this.N = (this.A & (1 << 7)) !== 0;
  }
}

const c = new CPU();
c.reset();

//console.log(c.mem);
