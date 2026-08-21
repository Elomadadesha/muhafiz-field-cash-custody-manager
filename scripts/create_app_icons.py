from pathlib import Path
from PIL import Image

src = Image.open('/home/ubuntu/upload/1000286998.png').convert('RGBA')
# Center-crop to square, add a small transparent-safe margin for launcher masks.
side = min(src.size)
left = (src.width - side) // 2
upper = (src.height - side) // 2
icon = src.crop((left, upper, left + side, upper + side))
root = Path('/home/ubuntu/muhafiz-field-cash-custody-manager/android/app/src/main/res')
sizes = {'mdpi':48, 'hdpi':72, 'xhdpi':96, 'xxhdpi':144, 'xxxhdpi':192}
for density, size in sizes.items():
    folder = root / f'mipmap-{density}'
    folder.mkdir(parents=True, exist_ok=True)
    rendered = icon.resize((size, size), Image.Resampling.LANCZOS)
    rendered.save(folder / 'ic_launcher.png', optimize=True)
    rendered.save(folder / 'ic_launcher_round.png', optimize=True)
    # Foreground fallback is intentionally the same complete artwork for legacy launchers.
    rendered.save(folder / 'ic_launcher_foreground.png', optimize=True)
print('created', sum(1 for _ in root.glob('mipmap-*/ic_launcher.png')), 'launcher assets')
