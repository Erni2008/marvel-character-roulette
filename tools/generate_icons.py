"""Reproducible geometric application emblem. No character assets."""
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[1]
S = 1024
im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
d.rounded_rectangle((40, 40, 984, 984), radius=210, fill='#080A10', outline='#242B3B', width=5)
# Angular red perimeter; gold monogram echoes the startup emblem.
d.polygon([(512,180),(800,345),(800,679),(512,844),(224,679),(224,345)], fill='#111625', outline='#FF3448', width=20)
d.line([(375,660),(512,365),(649,660)], fill='#F6C667', width=30, joint='curve')
d.line([(421,565),(603,565)], fill='#F6C667', width=25)
d.line([(288,400),(288,625)], fill='#FF3448', width=5)
for size in (16,32,64,128,256,512,1024):
    im.resize((size,size),Image.Resampling.LANCZOS).save(ROOT/f'macos/Runner/Assets.xcassets/AppIcon.appiconset/app_icon_{size}.png')
im.save(ROOT/'windows/runner/resources/app_icon.ico', sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
