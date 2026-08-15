from pathlib import Path

from PIL import Image


ASSET_NAMES = (
    "icon.png",
    "splash-icon.png",
    "favicon.png",
    "android-icon-foreground.png",
)


def main() -> None:
    assets_dir = Path(__file__).resolve().parents[1] / "assets" / "images"
    for name in ASSET_NAMES:
        path = assets_dir / name
        with Image.open(path) as image:
            image.convert("RGBA").save(path, format="PNG", optimize=True)
        print(f"Normalized {name} as PNG")


if __name__ == "__main__":
    main()
