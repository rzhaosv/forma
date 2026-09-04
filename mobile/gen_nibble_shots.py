"""Generate Nibble App Store screenshots (1290x2796) from raw device captures.

Composites existing 1170x2532 captures onto a brand-green gradient with a
headline/subtitle, a bezelled rounded phone frame, and per-screen patches:
  - home: replace the old "M" logo with the Nibble icon, fill in demo data
    (calorie ring, calories left, macro values/bars)
  - camera: place a real food photo inside the empty viewfinder
  - progress: fill in demo data (streak, averages, weekly bar chart, summary)
  - coaching: replace the word "Macra" with "Nibble"
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, 'screenshots')
OUT = os.path.join(SRC, 'nibble_aso')
ICON = os.path.join(BASE, 'assets', 'icon.png')
FOOD = os.path.join(BASE, 'assets', 'grilled-chicken-rice.jpg')
os.makedirs(OUT, exist_ok=True)

W, H = 1290, 2796
RAW_W, RAW_H = 1170, 2532

ARIAL_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
ARIAL = '/System/Library/Fonts/Supplemental/Arial.ttf'
SF = '/System/Library/Fonts/SFNS.ttf'

GRAD_TOP = (0x1F, 0x6B, 0x41)
GRAD_BOT = (0x0F, 0x2E, 0x1E)
HEADLINE = (255, 255, 255)
SUBTITLE = (0xCF, 0xE6, 0xD8)

# in-app palette (sampled from captures)
APP_BG = (10, 10, 12)
CARD_BG = (20, 20, 24)
TRACK = (37, 37, 40)
GREEN = (0, 230, 118)
ORANGE = (255, 159, 10)
WHITE_TXT = (240, 240, 245)
GREY_TXT = (107, 107, 128)
AXIS_TXT = (132, 132, 146)
BODY_TXT = (160, 160, 176)

# phone placement (matches the previous Macra set)
SCREEN_W = 1032
SCALE = SCREEN_W / RAW_W
SCREEN_H = round(RAW_H * SCALE)
SCREEN_X = (W - SCREEN_W) // 2
SCREEN_Y = 482
SCREEN_R = 60
BEZEL = 12
BEZEL_COL = (30, 30, 35)


# ---------------------------------------------------------------- helpers
def arial(size, bold=True):
    return ImageFont.truetype(ARIAL_BOLD if bold else ARIAL, size)


def sf(size, weight='Regular'):
    f = ImageFont.truetype(SF, size)
    f.set_variation_by_name(weight)
    return f


def fit_sf(text, weight, target_w=None, target_h=None):
    """Binary-search an SF font size so `text` renders at the measured width/height."""
    lo, hi = 8, 300
    for _ in range(30):
        mid = (lo + hi) / 2
        f = sf(round(mid), weight)
        bb = f.getbbox(text)
        val = (bb[2] - bb[0]) if target_w else (bb[3] - bb[1])
        target = target_w if target_w else target_h
        if val < target:
            lo = mid
        else:
            hi = mid
    return sf(round((lo + hi) / 2), weight)


def gradient(top, bot):
    g = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(g)
    for y in range(H):
        t = y / (H - 1)
        d.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    return g


def rrect(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def center_text(d, cx, top, text, font, fill):
    """Draw text horizontally centred on cx with the glyph box top at `top`."""
    bb = font.getbbox(text)
    w = bb[2] - bb[0]
    d.text((cx - w / 2 - bb[0], top - bb[1]), text, font=font, fill=fill)
    return w


def text_box(d, xy, text, font, fill, anchor='ls'):
    d.text(xy, text, font=font, fill=fill, anchor=anchor)


def headline(img, line1, line2, sub):
    d = ImageDraw.Draw(img)
    fh = arial(96, True)
    center_text(d, W / 2, 175, line1, fh, HEADLINE)
    center_text(d, W / 2, 283, line2, fh, HEADLINE)
    center_text(d, W / 2, 408, sub, arial(44, False), SUBTITLE)


def aa_layer(size, draw_fn, ss=4):
    """Render with draw_fn on a transparent supersampled layer and downsample."""
    big = Image.new('RGBA', (size[0] * ss, size[1] * ss), (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(big), ss)
    return big.resize(size, Image.LANCZOS)


def place_phone(canvas, screen):
    """Scale a patched 1170x2532 capture and paste it in a bezelled rounded frame."""
    scr = screen.convert('RGB').resize((SCREEN_W, SCREEN_H), Image.LANCZOS)
    # soft shadow
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    rrect(sd, (SCREEN_X - BEZEL, SCREEN_Y - BEZEL + 18, SCREEN_X + SCREEN_W + BEZEL, SCREEN_Y + SCREEN_H + BEZEL + 18),
          SCREEN_R + BEZEL, fill=(0, 0, 0, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    canvas.paste(shadow, (0, 0), shadow)
    # bezel
    d = ImageDraw.Draw(canvas)
    rrect(d, (SCREEN_X - BEZEL, SCREEN_Y - BEZEL, SCREEN_X + SCREEN_W + BEZEL, SCREEN_Y + SCREEN_H + BEZEL),
          SCREEN_R + BEZEL, fill=BEZEL_COL)
    # screen with rounded corners
    mask = Image.new('L', (SCREEN_W, SCREEN_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, SCREEN_W - 1, SCREEN_H - 1), radius=SCREEN_R, fill=255)
    canvas.paste(scr, (SCREEN_X, SCREEN_Y), mask)


def compose(name, screen, line1, line2, sub):
    img = gradient(GRAD_TOP, GRAD_BOT)
    headline(img, line1, line2, sub)
    place_phone(img, screen)
    path = os.path.join(OUT, name)
    img.save(path, optimize=True)
    print('wrote', path)


# ---------------------------------------------------------------- patches
def patch_home(im):
    d = ImageDraw.Draw(im)

    # 1) replace the old "M" logo (measured at x 60..144, y 193..270) with the Nibble icon
    box = (58, 188, 146, 276)  # 88 px square centred on the old logo
    d.rectangle((44, 176, 160, 288), fill=APP_BG)
    size = box[2] - box[0]
    icon = Image.open(ICON).convert('RGB').resize((size, size), Image.LANCZOS)
    m = Image.new('L', (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size - 1, size - 1), radius=round(size * 0.22), fill=255)
    im.paste(icon, (box[0], box[1]), m)

    # 2) calorie ring: 1290 / 2000 = 65 %
    cx, cy, r_out, thick = 584.5, 940.5, 270, 24
    frac = 1290 / 2000

    def draw_arc(dd, ss):
        # Pillow draws the arc width inward from the bbox, so the bbox is the OUTER edge
        bb = ((cx - r_out) * ss, (cy - r_out) * ss, (cx + r_out) * ss, (cy + r_out) * ss)
        dd.arc(bb, start=-90, end=-90 + 360 * frac, fill=GREEN + (255,), width=thick * ss)
        # round caps
        import math
        rm = r_out - thick / 2
        for ang in (-90, -90 + 360 * frac):
            ex = cx + rm * math.cos(math.radians(ang))
            ey = cy + rm * math.sin(math.radians(ang))
            dd.ellipse(((ex - thick / 2) * ss, (ey - thick / 2) * ss, (ex + thick / 2) * ss, (ey + thick / 2) * ss),
                       fill=GREEN + (255,))
    layer = aa_layer(im.size, draw_arc)
    im.paste(layer, (0, 0), layer)

    # 3) centre numbers: "0 /2000" + "0%"  ->  "1290 /2000" + "65%"
    d.rectangle((360, 868, 810, 1024), fill=CARD_BG)
    f_big = fit_sf('0', 'Bold', target_h=69)          # measured white "0" height
    f_small = fit_sf('2000', 'Bold', target_w=116)    # measured grey "2000" width
    f_pct = fit_sf('0%', 'Semibold', target_w=54)     # measured "0%" width
    baseline = 949
    big, small = '1290', '/2000'
    gap = 11
    wb = f_big.getlength(big)
    ws = f_small.getlength(small)
    x0 = cx - (wb + gap + ws) / 2
    text_box(d, (x0, baseline), big, f_big, WHITE_TXT)
    text_box(d, (x0 + wb + gap, baseline), small, f_small, GREY_TXT)
    center_text(d, cx, 988, '65%', f_pct, GREY_TXT)

    # 4) calories left: "2000" -> "710"
    d.rectangle((380, 1372, 790, 1494), fill=CARD_BG)
    f_left = fit_sf('2000', 'Bold', target_w=328)
    center_text(d, cx, 1384, '710', f_left, GREEN)

    # 5) macro values + bar fills
    f_val = fit_sf('0g / 150g', 'Medium', target_w=164)
    rows = [  # (value text, text row bottom of digits, bar row, fraction, colour)
        ('91g / 150g', 1620, 1648, 91 / 150, GREEN),
        ('94g / 250g', 1694, 1722, 94 / 250, GREEN),
        ('65g / 67g', 1768, 1796, 65 / 67, ORANGE),
    ]
    tx0, tx1 = 136, 1033
    for text, base, bar_y, frac, col in rows:
        d.rectangle((700, base - 40, 1010, base + 14), fill=CARD_BG)
        text_box(d, (999, base), text, f_val, GREY_TXT, anchor='rs')

    def draw_bars(dd, ss):
        for text, base, bar_y, frac, col in rows:
            x1 = tx0 + (tx1 - tx0) * frac
            dd.rounded_rectangle((tx0 * ss, bar_y * ss, x1 * ss, (bar_y + 9) * ss), radius=4.5 * ss, fill=col + (255,))
    layer = aa_layer(im.size, draw_bars)
    im.paste(layer, (0, 0), layer)
    return im


def patch_camera(im):
    """Fill the empty viewfinder (y 566..1991 is pure black) with a real food photo."""
    top, bottom = 600, 1960
    region_w, region_h = RAW_W, bottom - top
    ph = Image.open(FOOD).convert('RGB')
    s = max(region_w / ph.width, region_h / ph.height)
    ph = ph.resize((round(ph.width * s), round(ph.height * s)), Image.LANCZOS)
    # crop, biased slightly upward so the plate is centred
    ox = (ph.width - region_w) // 2
    oy = max(0, (ph.height - region_h) // 2 - 60)
    ph = ph.crop((ox, oy, ox + region_w, oy + region_h))
    m = Image.new('L', (region_w, region_h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, region_w - 1, region_h - 1), radius=28, fill=255)
    im.paste(ph, (0, top), m)
    return im


def patch_progress(im):
    d = ImageDraw.Draw(im)
    # 1) stat cards: "0", "0", "--"  ->  "12", "1,840", "78.4"
    f_stat = fit_sf('0', 'Bold', target_h=61)
    for (x0, x1), val in zip([(60, 389), (420, 749), (780, 1109)], ['12', '1,840', '78.4']):
        d.rectangle((x0 + 12, 430, x1 - 12, 528), fill=CARD_BG)
        center_text(d, (x0 + x1) / 2, 448, val, f_stat, GREEN)

    # 2) weekly chart: wipe axis + stub bars, redraw with data (keep title, x labels, goal caption)
    d.rectangle((70, 1150, 1100, 1745), fill=CARD_BG)
    values = [1920, 2010, 1780, 1860, 1690, 1950, 1670]   # avg 1,840
    label_rows = [(1197, 1222), (1321, 1346), (1445, 1470), (1568, 1594), (1692, 1718)]
    labels = ['2.4k', '1.8k', '1.2k', '600', '0']
    f_axis = fit_sf('0', 'Medium', target_h=19)
    for (ya, yb), lab in zip(label_rows, labels):
        text_box(d, (276, (ya + yb) / 2), lab, f_axis, AXIS_TXT, anchor='rm')
    y_top = (label_rows[0][0] + label_rows[0][1]) / 2
    y_base = (label_rows[-1][0] + label_rows[-1][1]) / 2
    vmax = 2400

    def yv(v):
        return y_base - (v / vmax) * (y_base - y_top)
    slots = [(363, 458), (472, 567), (581, 676), (690, 784), (799, 893), (907, 1002), (1016, 1076)]
    goal = 2000

    def draw_chart(dd, ss):
        # dashed goal line
        gy = yv(goal)
        x = 340
        while x < 1076:
            dd.line(((x * ss, gy * ss), (min(x + 14, 1076) * ss, gy * ss)), fill=GREY_TXT + (255,), width=2 * ss)
            x += 26
        for (x0, x1), v in zip(slots, values):
            col = ORANGE if v > goal else GREEN
            dd.rounded_rectangle((x0 * ss, yv(v) * ss, x1 * ss, (y_base + 3) * ss), radius=8 * ss, fill=col + (255,))
    layer = aa_layer(im.size, draw_chart)
    im.paste(layer, (0, 0), layer)
    # re-clip the chart to the card's right padding like the original (last bar cut at x=1076)
    d.rectangle((1077, 1150, 1100, 1745), fill=CARD_BG)

    # 3) summary rows
    f_sum = fit_sf('0 kcal', 'Semibold', target_w=124)
    for base, val in ((2261, '12,880 kcal'), (2379, '1,840 kcal')):
        d.rectangle((700, base - 42, 1045, base + 14), fill=CARD_BG)
        text_box(d, (1041, base), val, f_sum, WHITE_TXT, anchor='rs')
    return im


def patch_coaching(im):
    """'Macra adapts to your style — not the other way' -> 'Nibble adapts ...'"""
    d = ImageDraw.Draw(im)
    old = 'Macra adapts to your style — not the other way'
    new = 'Nibble adapts to your style — not the other way'
    f = fit_sf(old, 'Regular', target_w=1017)   # measured line width x 76..1092
    d.rectangle((60, 645, 1120, 712), fill=APP_BG)
    # original glyph box: x 76.., top 660, height 44 (with descenders)
    bb = f.getbbox(old)
    d.text((76 - bb[0], 660 - bb[1]), new, font=f, fill=BODY_TXT)
    return im


# ---------------------------------------------------------------- screens
def raw(name):
    return Image.open(os.path.join(SRC, name)).convert('RGB')


SHOTS = [
    ('01_track_calories.png', '1_home.png', patch_home,
     'Track Calories', 'in 5 Seconds', 'AI nutrition. No typing required.'),
    ('02_snap_photo.png', '2_camera.png', patch_camera,
     'Snap a Photo.', 'Get Nutrition Instantly.', 'AI identifies food & calculates macros.'),
    ('03_log_your_way.png', '2_social_proof.png', None,
     'Snap It. Say It.', 'Scan It.', 'Photo, voice or barcode. All under 10 seconds.'),
    ('04_personalized_plan.png', '2_transformation.png', None,
     'Your Personalized', 'Nutrition Plan', 'Macros calculated from your body & goals.'),
    ('05_progress.png', '4_progress.png', patch_progress,
     'See Your Progress.', 'Stay on Track.', 'Streaks, trends & insights at a glance.'),
    ('06_coaching.png', '5_paywall.png', patch_coaching,
     'Coaching That', 'Fits You', 'Guided, collaborative or independent. You choose.'),
]

if __name__ == '__main__':
    for out, src, patch, l1, l2, sub in SHOTS:
        im = raw(src)
        if patch:
            im = patch(im)
        if os.environ.get('NIBBLE_DEBUG'):
            im.save(os.path.join(OUT, '_patched_' + src))  # patched raw for inspection
        compose(out, im, l1, l2, sub)
