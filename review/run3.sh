#!/bin/bash
# usage: run3.sh <html> <tag> [pw]
S=/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad
for i in 1 2 3 4; do (timeout 2400 node /home/claude/star-player/review/xthru2.js $1 10 ${3:-0.5} > $S/x2_$2_$i.txt 2>&1 &); done
