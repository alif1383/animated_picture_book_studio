#!/usr/bin/env python3
"""
Ensure the Picture-Book Crayon Video Engine is available and ready to run.

Resolution order:
1. If `--in-place` is passed, prepare `<plugin-root>/engine` directly and run
   `pnpm install` if `node_modules` is missing.
2. Otherwise, check the target workspace (`--workspace <dir>`, defaulting to
   `Path.cwd()`). If `<workspace>/src/engine/schema.ts` does not exist yet (or
   `--scaffold` is passed), automatically copy `<plugin-root>/engine/` into
   `<workspace>`.
3. Ensure `node_modules` exists in the resolved engine directory by running
   `pnpm install` (unless `--no-install` is passed).
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
    in_place: bool = False,
    install_deps: bool = True,
) -> dict[str, object]:
    if in_place:
        deps_ready = ensure_dependencies(BUNDLED_ENGINE_DIR, run_install=install_deps)
        return {
            "engine_dir": str(BUNDLED_ENGINE_DIR),
            "source": "bundled_engine_in_place",
            "bundled_engine_dir": str(BUNDLED_ENGINE_DIR),
            "node_modules_ready": deps_ready,
        }

    target = (workspace or Path.cwd()).resolve()

    if is_engine_root(target) and not scaffold:
        deps_ready = ensure_dependencies(target, run_install=install_deps)
        return {
            "engine_dir": str(target),
            "source": "workspace",
            "bundled_engine_dir": str(BUNDLED_ENGINE_DIR),
            "node_modules_ready": deps_ready,
        }

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
        help="Force copying the bundled <plugin-root>/engine/ into --workspace.",
    )
    parser.add_argument(
        "--in-place",
        action="store_true",
        help="Use and install dependencies directly inside <plugin-root>/engine.",
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
        in_place=args.in_place,
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
