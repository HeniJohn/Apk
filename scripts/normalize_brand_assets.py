from pathlib import Path

from PIL import Image


ASSET_NAMES = (
    "icon.png",
    "splash-icon.png",
    "favicon.png",
    "android-icon-foreground.png",
)
MAX_ICON_DIMENSION = 1024


def main() -> None:
    assets_dir = Path(__file__).resolve().parents[1] / "assets" / "images"
    for name in ASSET_NAMES:
        path = assets_dir / name
        with Image.open(path) as image:
            rgba = image.convert("RGBA")
            if max(rgba.size) > MAX_ICON_DIMENSION:
                scale = MAX_ICON_DIMENSION / max(rgba.size)
                rgba = rgba.resize((round(rgba.width * scale), round(rgba.height * scale)), Image.Resampling.LANCZOS)
            rgba.save(path, format="PNG", optimize=True, compress_level=9)
        print(f"Normalized {name} as a {MAX_ICON_DIMENSION}px-or-smaller PNG")


if __name__ == "__main__":
    main()
