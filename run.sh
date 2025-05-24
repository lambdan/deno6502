#!/bin/sh
set -e

if [ -z "$1" ]; then
  echo './run.sh "0x69 0x69"'
  echo "or"
  echo './run.sh 6502-binary.bin'
  exit 1
fi



deno --allow-write --allow-read run.ts "$1"


