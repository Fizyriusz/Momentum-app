#!/usr/bin/env python3
"""Generuje komplet zasobów marki Duveo z jednego wzorca wektorowego."""
import os, io, cairosvg
from PIL import Image

OUT = "/mnt/user-data/outputs/duveo-brand"
for d in ["svg", "favicon", "pwa", "android", "ios", "social", "splash", "png"]:
    os.makedirs(f"{OUT}/{d}", exist_ok=True)

# ---- oryginalna geometria sygnetu (układ 44x32) -------------------------
D_PATH   = "M7 27 V5 H15 C23.5 5 27 10 27 16 C27 22 23.5 27 15 27 Z"
ARR_MAIN = "M26.8 12.8 L36.9 5.4"
ARR_HEAD = "39.5,3.5 36.63,8.77 33.61,4.65"
SW = 3.6

# ramka rysunku z uwzględnieniem zaokrąglonych końców kreski
BX0, BY0, BX1, BY1 = 7 - SW/2, 3.5 - 0.6, 39.5 + 0.6, 27 + SW/2
BW, BH = BX1 - BX0, BY1 - BY0
CX, CY = (BX0 + BX1) / 2, (BY0 + BY1) / 2

PURPLE, PURPLE_HOT, VOID, BONE = "#9333EA", "#C084FC", "#09090B", "#FAFAFA"


def mark(size=512, ratio=0.76, base=BONE, accent=PURPLE_HOT, bg=None, radius=None):
    """Sygnet wyśrodkowany optycznie w kwadracie o zadanym boku."""
    scale = (size * ratio) / BW
    tx, ty = size/2 - CX*scale, size/2 - CY*scale
    back = ""
    if bg:
        if radius:
            back = f'<rect width="{size}" height="{size}" rx="{radius}" fill="{bg}"/>'
        else:
            back = f'<rect width="{size}" height="{size}" fill="{bg}"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">
{back}
  <g transform="translate({tx:.3f} {ty:.3f}) scale({scale:.5f})"
     fill="none" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round">
    <path d="{D_PATH}" stroke="{base}"/>
    <path d="{ARR_MAIN}" stroke="{accent}"/>
    <polygon points="{ARR_HEAD}" fill="{accent}" stroke="{accent}" stroke-width="1.1"/>
  </g>
</svg>'''


def lockup(base=BONE, accent=PURPLE_HOT, gap=14):
    """Poziomy lockup: sygnet + napis DUVEO (tekst żywy, do zamiany na krzywe)."""
    h, scale = 64, 64 * 0.82 / BH
    mw = BW * scale
    tx, ty = 0 - BX0*scale + 2, h/2 - CY*scale
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {int(mw+gap+188)} {h}" height="{h}">
  <g transform="translate({tx:.3f} {ty:.3f}) scale({scale:.5f})"
     fill="none" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round">
    <path d="{D_PATH}" stroke="{base}"/>
    <path d="{ARR_MAIN}" stroke="{accent}"/>
    <polygon points="{ARR_HEAD}" fill="{accent}" stroke="{accent}" stroke-width="1.1"/>
  </g>
  <text x="{mw+gap:.1f}" y="{h/2+13:.1f}" fill="{base}"
        font-family="Archivo, Arial Black, sans-serif" font-size="38"
        font-weight="900" letter-spacing="3.4">DUVEO</text>
</svg>'''


def png(svg, path, w, h=None):
    cairosvg.svg2png(bytestring=svg.encode(), write_to=path,
                     output_width=w, output_height=h or w)


def save(name, text):
    with open(name, "w", encoding="utf-8") as f:
        f.write(text)


# ---- 1. mastery SVG ----------------------------------------------------
save(f"{OUT}/svg/duveo-mark.svg",           mark(512))
save(f"{OUT}/svg/duveo-mark-dark-bg.svg",   mark(512, bg=VOID, radius=112))
save(f"{OUT}/svg/duveo-mark-mono-black.svg", mark(512, base="#09090B", accent="#09090B"))
save(f"{OUT}/svg/duveo-mark-mono-white.svg", mark(512, base="#FFFFFF", accent="#FFFFFF"))
save(f"{OUT}/svg/duveo-logo-horizontal.svg", lockup())
save(f"{OUT}/svg/duveo-logo-horizontal-light.svg", lockup(base="#18181B", accent=PURPLE))
save(f"{OUT}/svg/favicon.svg",              mark(512, ratio=0.82))

# ---- 2. favicon --------------------------------------------------------
ico_sizes = [16, 32, 48, 64]
for s in ico_sizes:
    png(mark(512, ratio=0.84, bg=VOID, radius=96), f"{OUT}/favicon/favicon-{s}.png", s)
frames = [Image.open(f"{OUT}/favicon/favicon-{s}.png") for s in ico_sizes]
frames[0].save(f"{OUT}/favicon/favicon.ico", format="ICO",
               sizes=[(s, s) for s in ico_sizes])

# ---- 3. PWA ------------------------------------------------------------
png(mark(512, ratio=0.72, bg=VOID, radius=0), f"{OUT}/pwa/icon-192.png", 192)
png(mark(512, ratio=0.72, bg=VOID, radius=0), f"{OUT}/pwa/icon-512.png", 512)
# maskable: rysunek mieści się w bezpiecznej strefie 80%
png(mark(512, ratio=0.52, bg=VOID, radius=0), f"{OUT}/pwa/icon-maskable-192.png", 192)
png(mark(512, ratio=0.52, bg=VOID, radius=0), f"{OUT}/pwa/icon-maskable-512.png", 512)

# ---- 4. Android --------------------------------------------------------
for dpi, s in [("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144), ("xxxhdpi", 192)]:
    png(mark(512, ratio=0.72, bg=VOID, radius=0), f"{OUT}/android/ic_launcher-{dpi}-{s}.png", s)
    png(mark(512, ratio=0.72, bg=VOID, radius=256), f"{OUT}/android/ic_launcher_round-{dpi}-{s}.png", s)
# ikona adaptacyjna: warstwa pierwszoplanowa 432x432, rysunek w strefie 66/108
png(mark(512, ratio=0.42), f"{OUT}/android/ic_launcher_foreground-432.png", 432)
save(f"{OUT}/android/ic_launcher_background.xml",
     '<?xml version="1.0" encoding="utf-8"?>\n'
     '<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">\n'
     '    <solid android:color="#09090B"/>\n</shape>\n')
png(mark(512, ratio=0.72, bg=VOID, radius=0), f"{OUT}/android/play-store-512.png", 512)

# ---- 5. iOS / Apple ----------------------------------------------------
png(mark(512, ratio=0.70, bg=VOID, radius=0), f"{OUT}/ios/apple-touch-icon-180.png", 180)
png(mark(512, ratio=0.70, bg=VOID, radius=0), f"{OUT}/ios/AppIcon-1024.png", 1024)

# ---- 6. social / OG ----------------------------------------------------
og = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="g" cx="78%" cy="18%" r="72%">
      <stop offset="0%" stop-color="{PURPLE}" stop-opacity=".30"/>
      <stop offset="55%" stop-color="{PURPLE}" stop-opacity=".07"/>
      <stop offset="100%" stop-color="{PURPLE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="{VOID}"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate({96 - BX0*7.6:.2f} {150 - BY0*7.6:.2f}) scale(7.6)"
     fill="none" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round">
    <path d="{D_PATH}" stroke="{BONE}"/>
    <path d="{ARR_MAIN}" stroke="{PURPLE_HOT}"/>
    <polygon points="{ARR_HEAD}" fill="{PURPLE_HOT}" stroke="{PURPLE_HOT}" stroke-width="1.1"/>
  </g>
  <text x="96" y="420" fill="{BONE}" font-family="Archivo, Arial Black, sans-serif"
        font-size="86" font-weight="900" letter-spacing="-1">Sto pomysłów.</text>
  <text x="96" y="506" fill="{PURPLE_HOT}" font-family="Archivo, Arial Black, sans-serif"
        font-size="86" font-weight="900" letter-spacing="-1">Zero dowiezionych.</text>
  <text x="96" y="566" fill="#A1A1AA" font-family="IBM Plex Mono, monospace"
        font-size="26" letter-spacing="4">DUVEO &#183; SYSTEM EGZEKUCJI</text>
</svg>'''
save(f"{OUT}/social/og-image.svg", og)
png(og, f"{OUT}/social/og-image-1200x630.png", 1200, 630)

# ---- 7. splash (Capacitor, uniwersalny kwadrat) ------------------------
png(mark(512, ratio=0.30, bg=VOID), f"{OUT}/splash/splash-2732.png", 2732)
png(mark(512, ratio=0.30, bg=VOID), f"{OUT}/splash/splash-1200.png", 1200)

# ---- 8. podglądy PNG ---------------------------------------------------
png(mark(512), f"{OUT}/png/duveo-mark-1024-transparent.png", 1024)
png(mark(512, bg=VOID, radius=112), f"{OUT}/png/duveo-mark-1024-dark.png", 1024)

print("gotowe")
