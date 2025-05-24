function opLookup(opcode: number): string {
  switch (opcode) {
    case 0x00:
      return "BRK";
    case 0x69:
      return "ADC";
    case 0xa9:
      return "LDA (immediate)";
    case 0xea:
      return "NOP";
    case 0xc9:
      return "CMP";
    case 0x85:
      return "STA";
    case 0xe6:
      return "INC (zero page)";
    case 0xa5:
      return "LDA (zero page)";
    case 0x90:
      return "BCC";
    default:
      return `$${opcode.toString(16)}`;
  }
}

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
  /** Negative flag */
  N = 0;
  /** Overflow flag */
  V = 0;
  /** Break command */
  B = 0;
  /** Decimal mode */
  D = 0;
  /** Interrupt disable */
  I = 0;
  /** Zero flag */
  Z = 0;
  /** Carry flag */
  C = 0;
  /** Memory (64 KB) */
  mem: number[] = new Array(64 * 1024);
  /** How many cycles the CPU has done */
  cycles = 0;
  verbose = false;

  constructor(verbose = false) {
    this.verbose = verbose;
    this.reset(true);
  }

  /** "Resets" CPU. Parameter to set PC address */
  reset(clearMem = false) {
    this.PC = 0x00;
    this.A = 0;
    this.X = 0;
    this.Y = 0;
    this.SP = 0xfd;
    this.N = 0;
    this.V = 0;
    this.B = 0;
    this.D = 0;
    this.I = 0;
    this.Z = 0;
    this.C = 0;
    this.cycles = 0;
    if (clearMem) {
      for (let i = 0; i < this.mem.length; i++) {
        this.mem[i] = 0x00;
      }
    }
  }

  /** Read and increment PC */
  fetchPC(): number {
    return this.read(this.PC++);
  }

  read(addr: number) {
    if (addr < 0 || addr >= this.mem.length) {
      throw new Error(`Memory read out of bounds: ${addr}`);
    }
    const val = this.mem[addr];
    return val;
  }

  write(addr: number, val: number) {
    if (addr < 0 || addr >= this.mem.length) {
      throw new Error(`Memory write out of bounds: ${addr}`);
    }
    this.mem[addr] = val & 0xff;
    this.debugPrint(`wr ${addr}=${this.mem[addr]}`);
  }

  headerPrinted = false;
  debugPrint(msg = "") {
    if (!this.verbose) {
      return;
    }

    if (!this.headerPrinted) {
      console.log("PC\tA\tX\tY\tSP\t|NVBDIZC|\tCYCLE\tMessage");
      this.headerPrinted = true;
    }

    // PC, A, X, Y, SP, N, V, B, D, I, Z, C, CYCLE
    console.log(
      `${this.PC.toString(16).padStart(4, "0")}\t` +
        `${this.A.toString(16).padStart(2, "0")}\t` +
        `${this.X.toString(16).padStart(2, "0")}\t` +
        `${this.Y.toString(16).padStart(2, "0")}\t` +
        `${this.SP.toString(16).padStart(2, "0")}\t` +
        `|` +
        `${this.N}` +
        `${this.V}` +
        `${this.B}` +
        `${this.D}` +
        `${this.I}` +
        `${this.Z}` +
        `${this.C}` +
        `|\t` +
        `${this.cycles}\t${msg} `
    );
  }

  /** Execute PC. Returns false if BRK is hit. */
  exec() {
    const op = this.fetchPC();
    this.debugPrint(`executing ${op.toString(16)} (${opLookup(op)})`);

    switch (op) {
      case 0x00: // BRK
        // TODO
        this.B = 1;
        break;
      case 0xa9: // LDA Immediate
        this.OP_LDA_Immediate();
        break;
      case 0xa5: // LDA zero page
        this.OP_LDA_ZeroPage();
        break;
      case 0xea: // NOP
        this.OP_NOP();
        break;
      case 0x69: // ADC immediate
        this.OP_ADC_Immediate();
        break;
      case 0xc9: // CMP immediate
        this.OP_CMP_Immediate();
        break;
      case 0x85:
        this.OP_STA_ZeroPage();
        break;
      case 0xe6:
        this.OP_INC_ZeroPage();
        break;
      case 0x90:
        this.OP_BCC();
        break;
      default:
        throw new Error(`Unimplemented OP ${op.toString(16)}`);
    }
  }

  /** Sets PC to startAt, and then calls exec() until it returns false */
  run(from = 0x00) {
    this.debugPrint(`Running program from ${from.toString(16)}`);
    this.PC = from;
    while (this.B === 0) {
      // Execute until break
      this.exec();
    }
  }

  /** Supply program either as a number array or space separated string
   * ```ts
   * // Example
   * .executeProgram("0xa9 0x02 0xea 0x69 0x02"); // LDA #$02, NOP, ADC #$02
   * ```
   */
  loadProgram(prog: number[] | string, startAt = 0x00) {
    if (typeof prog === "string") {
      const s = prog.trim();
      prog = [];
      for (let byte of s.split(" ")) {
        if (byte.length === 2) {
          // add 0x prefix if missing ("hexdump mode")
          byte = "0x" + byte;
        }
        /*if (byte[0] === "$") {
          // replace $ with 0x
          byte = "0x" + byte.slice(1);
        }*/
        prog.push(+byte.trim());
      }
    }

    //console.log(prog);

    for (let i = 0; i < prog.length; i++) {
      this.mem[startAt + i] = prog[i] & 0xff;
    }
  }

  /** LDA Implementation
   * Z = 	Set if A = 0
   * N = Set if bit 7 of A is set
   */
  _LDA(val: number) {
    this.A = val;
    this.Z = +(this.A === 0);
    this.N = +((this.A & 0x80) !== 0);
    this.cycles += 2;
  }

  /**
   * LDA; value from next byte
   */
  OP_LDA_Immediate() {
    const val = this.fetchPC();
    this.debugPrint(`LDA #$${val.toString(16)}`);
    this._LDA(val);
  }

  /**
   * LDA; value read from adress
   */
  OP_LDA_ZeroPage() {
    const targetAddr = this.fetchPC();
    const val = this.read(targetAddr);
    this.cycles += 1;
    this.debugPrint(`LDA $${val.toString(16)}`);
    this._LDA(val);
  }

  /**
   * The NOP instruction causes no changes to the processor other than the normal incrementing of the program counter to the next instruction.
   */
  OP_NOP() {
    this.debugPrint("NOP");
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
    this.debugPrint(`ADC #${val.toString(16)}`);
    const result = this.A + val + (this.C ? 1 : 0);
    this.A = result & 0xff;
    this.Z = +((result & 0xff) === 0);
    this.C = +(result > 0xff);
    this.N = +((result & 0x80) !== 0);
    this.cycles += 2;
  }

  /**
   * This instruction compares the contents of the accumulator with another
   * memory held value and sets the zero and carry flags as appropriate.
   * C = set if A >= M
   * Z = set if A == M
   * N = set if bit 7 of the result is set
   */
  OP_CMP_Immediate() {
    const val = this.fetchPC();
    this.debugPrint(`CMP #${val.toString(16)}`);
    const result = this.A - val;
    this.C = +(result >= 0);
    this.Z = +(result === 0);
    this.N = +((result & 0x80) !== 0);
    this.cycles += 2;
  }

  /**
   * Stores the contents of the accumulator into memory.
   */
  OP_STA_ZeroPage() {
    const targetAddr = this.fetchPC();
    this.debugPrint(`STA #${targetAddr.toString(16)}`);
    this.write(targetAddr, this.A);
    this.cycles += 3;
  }

  /**
   * Adds one to the value held at a specified memory location setting the zero and negative flags as appropriate.
   * Z = set if result is zero
   * N = set if bit 7 of result is set
   */
  OP_INC_ZeroPage() {
    const targetAddr = this.fetchPC();
    this.debugPrint(`INC #${targetAddr.toString(16)}`);
    const result = this.read(targetAddr) + 0x01;
    this.write(targetAddr, result);
    this.Z = +(result === 0);
    this.N = +((result & 0x80) !== 0);
    this.cycles += 5;
  }

  /**
   * If the carry flag is clear then add the relative displacement to the program counter to cause a branch to a new location.
   */
  OP_BCC() {
    this.cycles += 2;
    const offset = this.fetchPC();
    if (this.C === 0) {
      // "If the carry flag is clear..."
      const oldPC = this.PC;
      const signedOffset = offset < 0x80 ? offset : offset - 0x100; // convert to signed

      this.PC += signedOffset;
      this.cycles += 1; // branch succeeds

      // new page
      if ((oldPC & 0xff00) !== (this.PC & 0xff00)) {
        this.cycles += 1;
      }
    }
  }
}
