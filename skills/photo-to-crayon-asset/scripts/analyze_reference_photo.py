#!/usr/bin/env python3
"""
analyze_reference_photo.py — Photo-to-Crayon Asset Color Analysis Tool

Loads a reference image, computes dimensions/aspect ratio, extracts dominant
color clusters from regions (top/middle/bottom + overall), and maps each
cluster to the nearest official TOKENS hex color from the Picture-Book
Crayon Video Engine. Outputs a structured JSON report.

Usage:
    python analyze_reference_photo.py <image_path> [--format=json|markdown]

Requires: Pillow (PIL)
"""

import sys
import json
import math
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is required. Install with: pip install Pillow", file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------------------
# Official TOKENS palette from <workspace>/src/theme/tokens.ts
# (bundled at <plugin-root>/engine/src/theme/tokens.ts)
# ---------------------------------------------------------------------------
TOKENS_COLORS = {
    # Paper Base
    "paperWarm": "#F4EFE6",
    "paperShadow": "#EDE6D6",
    "paperDeep": "#E2D9C5",
    # Outlines
    "charcoalOutline": "#2B231D",
    "faintPencil": "#4A4238",
    # Marker Wash
    "indigoNight": "#2E3B6E",
    "indigoNightDark": "#222C56",
    "indigoNightLight": "#3D4D87",
    # Dry Crayon & Oil Pastel
    "terracottaRoof": "#C84B31",
    "terracottaDark": "#A63822",
    "ochreWall": "#E3B464",
    "ochreLight": "#EED08A",
    "warmMoon": "#F0C243",
    "moonCheek": "#E58B3A",
    "sunsetOrange": "#E87A3E",
    "sunsetGold": "#F29F4B",
    "nightcapBlue": "#6A9EC0",
    "nightcapWhite": "#F2EDE2",
    "grassGreen": "#6B9E58",
    "treeGreen": "#588A47",
    "curtainPink": "#E5989B",
    "windowGlow": "#F4CA44",
    "dressPink": "#E8A5B8",
    "hairBrown": "#6D4C3D",
    "storeTeal": "#5B8E8D",
    "storeAwningRed": "#D15B47",
    "woodBrown": "#8A5A3B",
    "starWhite": "#F6F2E9",
    # Vibrant Daylight & Meadow
    "skyPastelBlue": "#9CCEF4",
    "skyPastelLight": "#B6DDF9",
    "meadowGreen": "#93C969",
    "meadowHorizonRose": "#C86D78",
    "radishRed": "#EE4B2B",
    "emeraldFrond": "#149658",
    "bananaYellow": "#FFCE34",
    "royalCrayonBlue": "#2541B2",
    "catLightBlue": "#79C2F2",
    "watermelonPink": "#F25268",
    "cherryRose": "#F26B8A",
    "cloudWhite": "#FAF8F4",
    "cutoutHaloWhite": "#FAF8F2",
    "cobaltStarBlue": "#1D63DC",
}

# Mapping from TOKENS color keys to recommended crayon fill patterns
TOKENS_PATTERNS = {
    "terracottaRoof": "pat-crayon-terracotta",
    "terracottaDark": "pat-crayon-terracotta",
    "ochreWall": "pat-crayon-ochre",
    "ochreLight": "pat-crayon-ochre",
    "warmMoon": "pat-crayon-warm-moon",
    "moonCheek": "pat-crayon-warm-moon",
    "sunsetOrange": "pat-crayon-sunset-orange",
    "sunsetGold": "pat-crayon-sunset-orange",
    "grassGreen": "pat-crayon-grass-green",
    "treeGreen": "pat-crayon-tree-green",
    "storeTeal": "pat-crayon-store-teal",
    "storeAwningRed": "pat-crayon-awning-red",
    "dressPink": "pat-crayon-dress-pink",
    "nightcapBlue": "pat-crayon-nightcap-blue",
    "woodBrown": "pat-crayon-wood-brown",
    "windowGlow": "pat-crayon-window-glow",
    "skyPastelBlue": "pat-crayon-sky-blue",
    "skyPastelLight": "pat-crayon-sky-blue",
    "meadowGreen": "pat-crayon-meadow-green",
    "radishRed": "pat-crayon-radish-red",
    "emeraldFrond": "pat-crayon-emerald-frond",
    "bananaYellow": "pat-crayon-banana-yellow",
    "royalCrayonBlue": "pat-crayon-royal-blue",
    "catLightBlue": "pat-crayon-cat-blue",
    "watermelonPink": "pat-crayon-watermelon-pink",
    "cherryRose": "pat-crayon-cherry-rose",
    "indigoNight": "pat-marker-indigo-night",
    "indigoNightDark": "pat-marker-indigo-night",
    "indigoNightLight": "pat-marker-indigo-night",
    "curtainPink": "pat-crayon-dress-pink",
    "meadowHorizonRose": "pat-crayon-cherry-rose",
    "cobaltStarBlue": "pat-crayon-royal-blue",
}


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert #RRGGBB hex string to (R, G, B) tuple."""
    h = hex_color.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def rgb_distance(c1: tuple[int, int, int], c2: tuple[int, int, int]) -> float:
    """Euclidean RGB distance between two colors."""
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))


def find_nearest_token(
    rgb: tuple[int, int, int],
) -> dict:
    """Find the nearest TOKENS palette color to the given RGB value."""
    best_name = ""
    best_hex = ""
    best_dist = float("inf")

    for name, hex_val in TOKENS_COLORS.items():
        token_rgb = hex_to_rgb(hex_val)
        dist = rgb_distance(rgb, token_rgb)
        if dist < best_dist:
            best_dist = dist
            best_name = name
            best_hex = hex_val

    pattern = TOKENS_PATTERNS.get(best_name, None)

    return {
        "token_name": best_name,
        "token_hex": best_hex,
        "rgb_distance": round(best_dist, 1),
        "suggested_pattern": pattern,
    }


def extract_dominant_colors(
    img: Image.Image, num_colors: int = 5
) -> list[dict]:
    """
    Extract dominant color clusters from an image region using Pillow's
    built-in quantization (median-cut algorithm).
    """
    # Resize to manageable size for speed
    small = img.copy()
    small.thumbnail((200, 200), Image.Resampling.LANCZOS)

    # Convert to RGB if needed (handles RGBA, P, L modes)
    if small.mode != "RGB":
        small = small.convert("RGB")

    # Quantize to palette
    quantized = small.quantize(colors=num_colors, method=Image.Quantize.MEDIANCUT)
    palette_data = quantized.getpalette()
    if palette_data is None:
        return []

    # Count pixels per palette index
    pixel_counts: dict[int, int] = {}
    for pixel in quantized.getdata():
        pixel_counts[pixel] = pixel_counts.get(pixel, 0) + 1

    total_pixels = small.width * small.height
    clusters = []

    # Sort by frequency (most common first)
    for idx, count in sorted(pixel_counts.items(), key=lambda x: -x[1]):
        if idx * 3 + 2 >= len(palette_data):
            continue
        r = palette_data[idx * 3]
        g = palette_data[idx * 3 + 1]
        b = palette_data[idx * 3 + 2]
        rgb = (r, g, b)
        hex_color = f"#{r:02X}{g:02X}{b:02X}"
        pct = round(100.0 * count / total_pixels, 1)
        nearest = find_nearest_token(rgb)

        clusters.append(
            {
                "rgb": list(rgb),
                "hex": hex_color,
                "percentage": pct,
                "nearest_token": nearest,
            }
        )

        if len(clusters) >= num_colors:
            break

    return clusters


def analyze_image(image_path: str, num_colors: int = 5) -> dict:
    """Full analysis of a reference photo for crayon asset creation."""
    path = Path(image_path)
    if not path.exists():
        return {"error": f"File not found: {image_path}"}

    img = Image.open(path)

    # Convert to RGB for analysis
    img_rgb = img.convert("RGB") if img.mode != "RGB" else img

    width, height = img.size
    aspect_ratio = round(width / height, 3) if height > 0 else 0

    # Split into thirds for region analysis
    third_h = height // 3

    top_region = img_rgb.crop((0, 0, width, third_h))
    mid_region = img_rgb.crop((0, third_h, width, 2 * third_h))
    bot_region = img_rgb.crop((0, 2 * third_h, width, height))

    report = {
        "file": str(path.resolve()),
        "dimensions": {
            "width": width,
            "height": height,
            "aspect_ratio": aspect_ratio,
            "aspect_description": (
                "landscape"
                if aspect_ratio > 1.1
                else "portrait"
                if aspect_ratio < 0.9
                else "square"
            ),
        },
        "regions": {
            "top_third": {
                "description": f"Top third (y: 0 to {third_h})",
                "dominant_colors": extract_dominant_colors(
                    top_region, num_colors
                ),
            },
            "middle_third": {
                "description": f"Middle third (y: {third_h} to {2 * third_h})",
                "dominant_colors": extract_dominant_colors(
                    mid_region, num_colors
                ),
            },
            "bottom_third": {
                "description": f"Bottom third (y: {2 * third_h} to {height})",
                "dominant_colors": extract_dominant_colors(
                    bot_region, num_colors
                ),
            },
            "overall": {
                "description": "Full image",
                "dominant_colors": extract_dominant_colors(
                    img_rgb, num_colors
                ),
            },
        },
    }

    return report


def format_markdown(report: dict) -> str:
    """Format the analysis report as a Markdown document."""
    if "error" in report:
        return f"**Error**: {report['error']}\n"

    lines = []
    dims = report["dimensions"]
    lines.append("# Reference Photo Analysis Report\n")
    lines.append(f"**File**: `{report['file']}`\n")
    lines.append(
        f"**Dimensions**: {dims['width']} × {dims['height']} "
        f"({dims['aspect_description']}, ratio: {dims['aspect_ratio']})\n"
    )

    for region_key, region in report["regions"].items():
        lines.append(f"\n## {region['description']}\n")
        lines.append(
            "| # | Photo Color | % | → TOKENS Color | Token Hex | Distance | Pattern |"
        )
        lines.append(
            "|---|---|---|---|---|---|---|"
        )
        for i, cluster in enumerate(region["dominant_colors"], 1):
            nt = cluster["nearest_token"]
            pattern_str = nt["suggested_pattern"] or "—"
            lines.append(
                f"| {i} | `{cluster['hex']}` | {cluster['percentage']}% "
                f"| `{nt['token_name']}` | `{nt['token_hex']}` "
                f"| {nt['rgb_distance']} | `{pattern_str}` |"
            )

    return "\n".join(lines)


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(
            "Usage: python analyze_reference_photo.py <image_path> "
            "[--format=json|markdown] [--colors=N]\n\n"
            "Analyzes a reference photo and maps dominant regional colors to official "
            "Picture-Book Studio TOKENS colors and crayon fill patterns."
        )
        sys.exit(0 if len(sys.argv) >= 2 and sys.argv[1] in ("-h", "--help") else 1)

    image_path = sys.argv[1]
    output_format = "json"
    num_colors = 5

    for arg in sys.argv[2:]:
        if arg.startswith("--format="):
            output_format = arg.split("=", 1)[1].lower()
        elif arg.startswith("--colors="):
            num_colors = int(arg.split("=", 1)[1])

    report = analyze_image(image_path, num_colors=num_colors)

    if "error" in report:
        print(f"Error: {report['error']}", file=sys.stderr)
        sys.exit(1)

    if output_format == "markdown":
        print(format_markdown(report))
    else:
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
