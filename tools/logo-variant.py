#!/usr/bin/env python3
"""Make the dark-background variant of a brand logo: near-black fills become white,
brand colours (e.g. Petpooja red) stay. Used for intro/outro on the navy background.

  python3 tools/logo-variant.py brand/<name>.svg engine/public/brand/<name>-white.svg
"""
import re
import sys
from pathlib import Path

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
svg = src.read_text()


def is_dark(hex_colour: str) -> bool:
    h = hex_colour.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    # only near-black, low-saturation colours (the wordmark); saturated brand colours stay
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 70 and max(r, g, b) - min(r, g, b) < 40


out = re.sub(r'(fill|stroke)="(#[0-9A-Fa-f]{3,6})"',
             lambda m: f'{m.group(1)}="#FFFFFF"' if is_dark(m.group(2)) else m.group(0), svg)
dst.parent.mkdir(parents=True, exist_ok=True)
dst.write_text(out)
print(f"{dst}: {len(re.findall('#FFFFFF', out)) - len(re.findall('#FFFFFF', svg))} dark fills → white")
