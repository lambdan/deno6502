import os, sys

infile = sys.argv[1]
outfile = infile + ".bin"

if not os.path.exists(infile):
    print(f"Error: Input file '{infile}' does not exist.")
    sys.exit(1)

lines = []
with open(infile, 'r') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith(';'):
            continue  # Skip empty lines and comments
        lines.append(line.split(";")[0].strip())

byteMapping = {
    "BCC": 0x90,
    "INC": 0xE6,
    "LDA": 0xA9,
    "STA": 0x85,
    "CMP": 0xC9,
}

outBytes = []

loopLabels = {}
for line in lines:
    if line.endswith(":"):
        # loop label!
        label = line[:-1].strip()
        loopLabels[label] = len(outBytes)
        continue
    key,val = line.split(" ")
    key = key.strip().upper()
    if key in byteMapping:
        outBytes.append(byteMapping[key])
        if key == "BCC" and val in loopLabels:
            # calculate offset for loop labels
            outBytes.append(loopLabels[val] - len(outBytes) - 1)
        elif val.startswith("$"):
            # An adress pointer? Might need to change to LDA zero page version
            old = outBytes.pop()
            if old == 0xA9:  # LDA
                outBytes.append(0xA5)  # Change to LDA zero page
            else:
                outBytes.append(old)  # Keep the original byte
            outBytes.append(val[1:])
        elif val.startswith("#$"):
            # Immediate value
            outBytes.append(val[2:])
    else:
        print(f"Error: Unknown instruction '{key}' in line '{line}'")
        sys.exit(1)


# Convert hexadecimal strings to integers
outBytes = [int(b, 16) if isinstance(b, str) else b for b in outBytes]

# sign everything
outBytes = [b & 0xFF for b in outBytes]

with open(outfile, 'wb') as f:
    f.write(bytearray(outBytes))