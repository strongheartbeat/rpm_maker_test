#!/bin/bash
find ./app -name "*" -print | cpio --format newc -o > test.cpio
