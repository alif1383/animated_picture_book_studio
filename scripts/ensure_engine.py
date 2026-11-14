#!/usr/bin/env python3
"""
Ensure the Picture-Book Crayon Video Engine is available in the active workspace
and ready to run (zero external dependencies: uses pre-bundled `vendor/` inside
`<plugin-root>/engine/`).
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path


PLUGIN_ROOT = Path(__file__).resolve().parent.parent
BUNDLED_ENGINE_DIR = PLUGIN_ROOT / "engine"
SKIP_DIRS = {"node_modules", "dist", ".git", "__pycache__"}
ALWAYS_UPDATE_FILES = {"package.json", "tsconfig.json", "vite.config.ts"}


def is_engine_root(path: Path) -> bool:
    return (path / "src" / "engine" / "schema.ts").is_file()


def has_modular_assets(path: Path) -> bool:
    return (path / "src" / "assets" / "characters" / "cat.ts").is_file()


def has_vendor_bundle(path: Path) -> bool:
    return (
        (path / "vendor" / "typescript" / "lib" / "typescript.js").is_file()
        and (path / "vendor" / "mp4-muxer" / "mp4-muxer.mjs").is_file()
        and (path / "vendor" / "isomorphic-git" / "index.mjs").is_file()
        and (path / "scripts" / "studio-cli.mjs").is_file()
    )


def copy_bundled_engine(target_dir: Path, overwrite: bool = True) -> None:
    if not is_engine_root(BUNDLED_ENGINE_DIR):
        raise FileNotFoundError(f"Bundled engine not found at {BUNDLED_ENGINE_DIR}")
    target_dir.mkdir(parents=True, exist_ok=True)
    for item in BUNDLED_ENGINE_DIR.iterdir():
        if item.name in SKIP_DIRS:
            continue
        dest = target_dir / item.name
        if item.is_dir():
            force_dir = item.name in {"vendor", "scripts"}
            if overwrite or force_dir:
                shutil.copytree(item, dest, dirs_exist_ok=True)
            else:
                for src_file in item.rglob("*"):
                    if src_file.is_dir():
                        continue
                    rel = src_file.relative_to(item)
                    dest_file = dest / rel
                    dest_file.parent.mkdir(parents=True, exist_ok=True)
                    if not dest_file.exists():
                        shutil.copy2(src_file, dest_file)
        else:
            if overwrite or not dest.exists() or item.name in ALWAYS_UPDATE_FILES:
                shutil.copy2(item, dest)

    exports_keep = target_dir / "exports" / ".gitkeep"
    exports_keep.parent.mkdir(parents=True, exist_ok=True)
    if not exports_keep.exists():
        exports_keep.touch()


def resolve_engine(workspace: Path | None = None, scaffold: bool = False) -> dict[str, object]:
    cwd = (workspace or Path.cwd()).resolve()
    if is_engine_root(cwd) and not scaffold:
        if cwd != BUNDLED_ENGINE_DIR.resolve():
            copy_bundled_engine(cwd, overwrite=not has_modular_assets(cwd))
        return {
            "engine_dir": str(cwd),
            "source": "workspace",
            "bundled_engine_dir": str(BUNDLED_ENGINE_DIR),
            "vendor_ready": has_vendor_bundle(cwd),
        }

    copy_bundled_engine(cwd, overwrite=True)
    return {
        "engine_dir": str(cwd),
        "source": "scaffolded_from_bundled_engine",
        "bundled_engine_dir": str(BUNDLED_ENGINE_DIR),
        "vendor_ready": has_vendor_bundle(cwd),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Ensure the active workspace has the self-contained Picture-Book Studio engine."
    )
    parser.add_argument("--workspace", type=Path, default=None)
    parser.add_argument("--scaffold", action="store_true")
    parser.add_argument("--no-install", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    result = resolve_engine(workspace=args.workspace, scaffold=args.scaffold)
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(
            f"Engine ready at: {result['engine_dir']} "
            f"(source: {result['source']}, vendor_ready: {result['vendor_ready']})"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
