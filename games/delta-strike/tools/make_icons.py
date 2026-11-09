#!/usr/bin/env python3
"""Generate icons/icon-192.png and icons/icon-512.png. Stdlib only.
Recipe: docs/plan/interfaces.md §8.4 (water background, grass columns, player)."""
import struct, zlib, os

PLAYER = [
    "......YY......",
    "......YY......",
    ".....YYYY.....",
    ".....YYYY.....",
    "....YYYYYY....",
    ".YYYYYYYYYYYY.",
    "YYYYYYYYYYYYYY",
    "YYY..YYYY..YYY",
    ".....YYYY.....",
    "..Y..YYYY..Y..",
    ".YYYYYYYYYYYY.",
    ".YYY..YY..YYY.",
]
WATER  = (0x58, 0x4F, 0xDA, 255)   # DS.C.PALETTE.WATER
GRASS  = (0x64, 0x92, 0x28, 255)   # DS.C.PALETTE.GRASS_A
YELLOW = (0xFF, 0xF4, 0x56, 255)   # DS.C.PALETTE.YELLOW

def chunk(tag, data):
    return (struct.pack('>I', len(data)) + tag + data
            + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF))

def build(size, scale):
    col = size // 5
    px = [[WATER] * size for _ in range(size)]
    for y in range(size):
        for x in range(col):
            px[y][x] = GRASS
            px[y][size - 1 - x] = GRASS
    pw, ph = 14 * scale, 12 * scale
    ox, oy = (size - pw) // 2, (size - ph) // 2
    for ry, row in enumerate(PLAYER):
        for rx, ch in enumerate(row):
            if ch != 'Y':
                continue
            for dy in range(scale):
                for dx in range(scale):
                    px[oy + ry * scale + dy][ox + rx * scale + dx] = YELLOW
    raw = bytearray()
    for row in px:
        raw += b'\x00'
        for p in row:
            raw += bytes(p)
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr)
            + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b''))

def main():
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')
    os.makedirs(out, exist_ok=True)
    for size, scale in ((192, 8), (512, 24)):
        path = os.path.join(out, 'icon-%d.png' % size)
        with open(path, 'wb') as f:
            f.write(build(size, scale))
        print('wrote', path)

if __name__ == '__main__':
    main()
