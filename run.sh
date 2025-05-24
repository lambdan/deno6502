#!/bin/sh
set -e
deno --allow-write run.ts
echo
echo
echo
hexdump -C mem.bin


