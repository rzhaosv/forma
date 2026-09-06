"""Per-app Open Graph cards (1200x630): app icon, name, one line, on the app's own ground.
Every app page was sharing Nibble's icon as its social preview."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
WS = '/Users/raymondzhao/workspace'
OUT = f'{WS}/forma/web/assets/og'
ARIAL_B = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
ARIAL = '/System/Library/Fonts/Supplemental/Arial.ttf'

# slug, repo (None = icon from web/assets/icons), name, line, bg, ink, soft
APPS = [
    ('kotatsu', 'kotatsu', 'Kotatsu', 'Six friends who kept your seat.', '#1F1B16', '#F6EFE3', '#CDBBA3'),
    ('sesame', 'sesame', 'Sesame', '120 high-protein Asian recipes, macros done.', '#FBF6EE', '#1F1B16', '#6B6157'),
    ('evensong', 'evensong', 'Evensong', 'A reading to begin the day, and one to end it.', '#141A28', '#E6B655', '#B9B3A6'),
    ('stride', 'stride', 'Stride', 'Count steps, not calories.', '#0F1A17', '#9BE8B6', '#9FB3AA'),
    ('lantern', 'lantern', 'Lantern', 'A seven-minute daily ritual.', '#12100C', '#E8C77A', '#B6AE9C'),
    ('tomorrowyou', 'tomorrowyou', 'Tomorrow You', 'Drink less, and see the morning you get back.', '#1A1526', '#F4C77B', '#B4AAC2'),
    ('wisp', 'wisp', 'Wisp', 'Ride out the craving. Three minutes.', '#0E1B1E', '#8FE3D6', '#9DB4B6'),
    ('lapis', 'lapis', 'Lapis', 'Identify any rock or crystal.', '#0E1430', '#D9B45A', '#A6AEC8'),
    ('ascension', 'ascension', 'Ascension', 'An honest scan, a real plan, a squad.', '#0D1117', '#7EA6FF', '#9AA4B2'),
    ('cutoff', 'cutoff', 'Cutoff', 'Members-only AI fit check.', '#0B0B0B', '#EDEDED', '#9A9A9A'),
    ('plainly', 'plainly', 'Plainly', 'Dating and friends, said plainly.', '#161326', '#C9B6F5', '#A69EBC'),
]


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def wrap(d, text, font, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def rounded(size, r):
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=r, fill=255)
    return m


def card(slug, repo, name, line, bg, ink, soft):
    icon_path = f'{WS}/{repo}/assets/icon.png' if repo else f'{WS}/forma/web/assets/icons/{slug}.png'
    if not os.path.exists(icon_path):
        print('skip (no icon)', slug); return
    im = Image.new('RGB', (W, H), hexrgb(bg))

    # a soft glow behind the icon, in the accent colour
    glow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(glow).ellipse((90 - 160, 315 - 160, 90 + 320 + 160, 315 + 160 + 160), fill=255)
    glow = glow.filter(ImageFilter.GaussianBlur(150))
    im = Image.composite(Image.new('RGB', (W, H), hexrgb(ink)), im, glow.point(lambda v: int(v * 0.10)))

    ic = Image.open(icon_path).convert('RGB').resize((232, 232), Image.LANCZOS)
    ix, iy = 92, (H - 232) // 2
    sh = Image.new('L', (W, H), 0)
    ImageDraw.Draw(sh).rounded_rectangle((ix, iy + 12, ix + 232, iy + 232 + 12), radius=60, fill=150)
    im = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), im, sh.filter(ImageFilter.GaussianBlur(28)))
    im.paste(ic, (ix, iy), rounded(ic.size, 52))

    d = ImageDraw.Draw(im)
    tx, maxw = 384, W - 384 - 92
    nf = ImageFont.truetype(ARIAL_B, 76)
    while d.textlength(name, font=nf) > maxw and nf.size > 44:
        nf = ImageFont.truetype(ARIAL_B, nf.size - 4)
    lf = ImageFont.truetype(ARIAL, 34)
    lines = wrap(d, line, lf, maxw)
    block = 76 + 22 + len(lines) * 46 + 20 + 30
    y = (H - block) // 2
    d.text((tx, y), name, font=nf, fill=hexrgb(ink)); y += 76 + 22
    for ln in lines:
        d.text((tx, y), ln, font=lf, fill=hexrgb(soft)); y += 46
    y += 20
    d.rounded_rectangle((tx, y, tx + 54, y + 6), radius=3, fill=hexrgb(ink))
    d.text((tx + 74, y - 11), 'tryforma.app', font=ImageFont.truetype(ARIAL, 26), fill=hexrgb(soft))

    os.makedirs(OUT, exist_ok=True)
    p = f'{OUT}/{slug}.png'
    im.save(p, 'PNG', optimize=True)
    print('wrote', p, os.path.getsize(p) // 1024, 'KB')


if __name__ == '__main__':
    for a in APPS:
        card(*a)
