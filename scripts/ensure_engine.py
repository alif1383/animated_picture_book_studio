#!/usr/bin/env python3
"""
Ensure the Picture-Book Crayon Video Engine is available and ready to run.

Resolution order:
1. If the current workspace (or --workspace) already has `src/engine/schema.ts`,
   use that workspace directory.
2. Else if `D:\\picture_book\\src\\engine\\schema.ts` exists with `node_modules`
   (and `--scaffold` was not explicitly passed), use `D:\\picture_book`.
3. Otherwise (or when `--scaffold` is passed), copy the plugin's bundled
   `<plugin-root>/engine/` directory into the target workspace and run
   `pnpm install` so the user has a complete, self-contained engine setup
   without needing `D:\\picture_book` pre-cloned.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path


PLUGIN_ROOT = Path(__file__).resolve().parent.parent
BUNDLED_ENGINE_DIR = PLUGIN_ROOT / "engine"
DEFAULT_PREINSTALLED_ENGINE = Path(r"D:\picture_book")


def is_engine_root(path: Path) -> bool:
    return (path / "src" / "engine" / "schema.ts").is_file()


def has_node_modules(path: Path) -> bool:
    return (path / "node_modules").is_dir()


def copy_bundled_engine(target_dir: Path) -> None:
    if not is_engine_root(BUNDLED_ENGINE_DIR):
        raise FileNotFoundError(
            f"Bundled engine not found at {BUNDLED_ENGINE_DIR}"
        )
    target_dir.mkdir(parents=True, exist_ok=True)
    for item in BUNDLED_ENGINE_DIR.iterdir():
        if item.name in {"node_modules", "dist", ".git"}:
            continue
        dest = target_dir / item.name
        if item.is_dir():
            shutil.copytree(item, dest, dirs_exist_ok=True)
        else:
            shutil.copy2(item, dest)
    exports_keep = target_dir / "exports" / ".gitkeep"
    exports_keep.parent.mkdir(parents=True, exist_ok=True)
    if not exports_keep.exists():
        exports_keep.touch()


def ensure_dependencies(engine_dir: Path, run_install: bool = True) -> bool:
    if has_node_modules(engine_dir):
        return True
    if not run_install:
        return False
    pnpm_cmd = "pnpm.cmd" if os.name == "nt" else "pnpm"
    subprocess.run([pnpm_cmd, "install"], cwd=str(engine_dir), check=True)
    return has_node_modules(engine_dir)


def resolve_engine(
    workspace: Path | None = None,
    scaffold: bool = False,
    install_deps: bool = True,
) -> dict[str, object]:
    cwd = (workspace or Path.cwd()).resolve()

    # 1. Current workspace already has the Picture-Book Studio engine
    if is_engine_root(cwd) and not scaffold:
        deps_ready = ensure_dependencies(cwd, run_install=install_deps)
        return {
            "engine_dir": str(cwd),
            "source": "workspace",
            "bundled_engine_dir": str(BUNDLED_ENGINE_DIR),
            "node_modules_ready": deps_ready,
        }

    # 2. Pre-installed D:\picture_book exists with node_modules
    if (
        not scaffold
        and is_engine_root(DEFAULT_PREINSTALLED_ENGINE)
        and has_node_modules(DEFAULT_PREINSTALLED_ENGINE)
    ):
        return {
            "engine_dir": str(DEFAULT_PREINSTALLED_ENGINE),
            "source": "preinstalled_d_picture_book",
            "bundled_engine_dir": str(BUNDLED_ENGINE_DIR),
            "node_modules_ready": True,
        }

    # 3. Scaffold from the plugin's bundled engine/ directory into target workspace
    target = cwd
    copy_bundled_engine(target)
    deps_ready = ensure_dependencies(target, run_install=install_deps)
    return {
        "engine_dir": str(target),
        "source": "scaffolded_from_bundled_engine",
        "bundled_engine_dir": str(BUNDLED_ENGINE_DIR),
        "node_modules_ready": deps_ready,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Locate or scaffold the Picture-Book Studio engine from the bundled plugin."
    )
    parser.add_argument(
        "--workspace",
        type=Path,
        default=None,
        help="Target workspace directory (defaults to current working directory).",
    )
    parser.add_argument(
        "--scaffold",
        action="store_true",
        help="Force copying the bundled engine/ into --workspace even if D:\\picture_book exists.",
    )
    parser.add_argument(
        "--no-install",
        action="store_true",
        help="Skip running `pnpm install` when node_modules is missing.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output resolution result as JSON.",
    )
    args = parser.parse_args()

    result = resolve_engine(
        workspace=args.workspace,
        scaffold=args.scaffold,
        install_deps=not args.no_install,
    )
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(
            f"Engine ready at: {result['engine_dir']} "
            f"(source: {result['source']}, node_modules: {result['node_modules_ready']})"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
