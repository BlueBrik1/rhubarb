#!/usr/bin/env python3
"""Rhubarb IDE — a React + Tailwind UI over the same file/run/translate
logic the old Tkinter IDE used. The UI talks to this process over
pywebview's JS bridge; nothing about how a .rhubarb file is opened,
saved, run, or translated to Python has changed."""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

import webview

ROOT = Path(__file__).resolve().parent
RUNNER = ROOT / "rhubarb.py"
DIST_INDEX = ROOT / "webui" / "dist" / "index.html"
BLOCKED_DIR_NAMES = {"codexdonottouch"}
SEARCH_SKIP_DIR_NAMES = BLOCKED_DIR_NAMES | {"node_modules", "__pycache__", ".git", "dist", "build"}
SEARCH_MAX_FILES_SCANNED = 5000
SEARCH_MAX_MATCHING_FILES = 200
SEARCH_MAX_MATCHES_PER_FILE = 50

STARTER_CODE = '''# Rhubarb is based on Python.
# You can write normal Python, plus these shortcuts:
#   say "hello"
#   set name = "Mihir"
#   repeat 3:

say "Hello from Rhubarb!"

set language = "Python-powered"
say f"Rhubarb is {language}."

repeat 3:
    say "rhubarb!"
'''


def is_blocked_path(path: Path) -> bool:
    return any(part in BLOCKED_DIR_NAMES for part in path.parts)


def list_children(directory: Path) -> list[dict]:
    try:
        entries = sorted(directory.iterdir(), key=lambda path: (path.is_file(), path.name.lower()))
    except (PermissionError, OSError):
        return []

    children = []
    for path in entries:
        if is_blocked_path(path) or path.name.startswith("."):
            continue
        is_dir = path.is_dir()
        children.append({"name": path.name, "path": str(path), "isDir": is_dir, "hasChildren": is_dir})
    return children


def iter_workspace_files(root: Path):
    """Depth-first walk that prunes noisy/blocked directories (node_modules,
    __pycache__, .git, ...) before descending into them, instead of walking
    everything and filtering after the fact."""
    stack = [root]
    while stack:
        current = stack.pop()
        try:
            entries = list(current.iterdir())
        except (PermissionError, OSError):
            continue
        for entry in entries:
            if entry.name.startswith("."):
                continue
            if entry.is_dir():
                if entry.name in SEARCH_SKIP_DIR_NAMES or is_blocked_path(entry):
                    continue
                stack.append(entry)
            elif not is_blocked_path(entry):
                yield entry


class Api:
    # NOTE: pywebview exposes every non-underscore, non-callable attribute
    # of this object to JS by recursively walking it with dir()/getattr().
    # That makes plain instance state (a Path, a Window) dangerous to store
    # under a public name — pywebview will try to treat it as a nested API
    # namespace and walk *its* attributes too, which for a webview.Window
    # recurses into WinForms internals and blows the stack. Every piece of
    # state is private (leading underscore) for exactly this reason; only
    # methods meant to be called from JS are public.

    def __init__(self) -> None:
        self._workspace = ROOT
        self._current_file: Path | None = None
        self._pending_save_directory: Path | None = None
        self._window: webview.Window | None = None

    # ---- workspace tree -------------------------------------------------

    def list_workspace(self) -> dict:
        tree = {
            "name": self._workspace.name,
            "path": str(self._workspace),
            "isDir": True,
            "hasChildren": True,
            "children": list_children(self._workspace),
        }
        return {"workspaceName": str(self._workspace), "tree": tree}

    def list_dir(self, path: str) -> list[dict]:
        return list_children(Path(path))

    def choose_workspace(self) -> dict:
        result = self._window.create_file_dialog(webview.FOLDER_DIALOG, directory=str(self._workspace))
        if not result:
            return {"cancelled": True}
        workspace = Path(result[0] if isinstance(result, (list, tuple)) else result)
        if is_blocked_path(workspace):
            return {"error": "That folder is blocked."}
        self._workspace = workspace
        return self.list_workspace()

    def open_file_dialog(self) -> dict:
        result = self._window.create_file_dialog(
            webview.OPEN_DIALOG,
            directory=str(self._workspace),
            file_types=("Rhubarb (*.rhubarb)", "Python (*.py)", "All files (*.*)"),
        )
        if not result:
            return {"cancelled": True}
        target = Path(result[0] if isinstance(result, (list, tuple)) else result)
        return self.open_file(str(target))

    def _selected_directory(self, selected_path: str | None) -> Path:
        if not selected_path:
            return self._workspace
        path = Path(selected_path)
        return path if path.is_dir() else path.parent

    # ---- file operations -------------------------------------------------

    def new_file_content(self, selected_path: str | None) -> dict:
        self._current_file = None
        self._pending_save_directory = self._selected_directory(selected_path)
        return {"content": STARTER_CODE, "directoryName": self._pending_save_directory.name}

    def open_file(self, path: str) -> dict:
        target = Path(path)
        if is_blocked_path(target):
            return {"error": "That file is blocked."}
        try:
            source = target.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return {"error": "This does not look like a text file."}
        except OSError as error:
            return {"error": str(error)}

        self._current_file = target
        self._pending_save_directory = target.parent
        display_path = str(target.relative_to(self._workspace)) if target.is_relative_to(self._workspace) else str(target)
        return {"path": str(target), "name": target.name, "content": source, "displayPath": display_path}

    def save_file(self, path: str | None, content: str) -> dict:
        if path is None:
            initial_directory = self._pending_save_directory or self._workspace
            if is_blocked_path(initial_directory):
                initial_directory = self._workspace
            result = self._window.create_file_dialog(
                webview.SAVE_DIALOG,
                directory=str(initial_directory),
                save_filename="Untitled.rhubarb",
                file_types=("Rhubarb (*.rhubarb)", "Python (*.py)", "All files (*.*)"),
            )
            if not result:
                return {"cancelled": True}
            target = Path(result[0] if isinstance(result, (list, tuple)) else result)
            self._current_file = target
            self._pending_save_directory = target.parent
        else:
            self._current_file = Path(path)

        if is_blocked_path(self._current_file):
            return {"error": "Saving inside codexdonottouch is blocked."}

        self._current_file.write_text(content.rstrip() + "\n", encoding="utf-8")
        return {"path": str(self._current_file), "name": self._current_file.name}

    def run_file(self, path: str | None, content: str) -> dict:
        saved = self.save_file(path, content)
        if saved.get("cancelled") or saved.get("error"):
            return saved

        target = Path(saved["path"])
        if is_blocked_path(target):
            return {"error": "Running files inside codexdonottouch is blocked."}

        command = [sys.executable, str(target)] if target.suffix == ".py" else [sys.executable, str(RUNNER), str(target)]
        completed = subprocess.run(command, capture_output=True, text=True, cwd=str(target.parent))
        text = completed.stdout
        if completed.stderr:
            text += ("\n" if text else "") + completed.stderr
        if not text:
            text = f"Finished with exit code {completed.returncode}."

        return {
            "output": text,
            "exitCode": completed.returncode,
            "isError": bool(completed.returncode),
            "path": saved["path"],
            "name": saved["name"],
        }

    def show_python(self, content: str) -> dict:
        import rhubarb

        try:
            return {"python": rhubarb.translate(content)}
        except Exception as error:  # noqa: BLE001 - surfaced to the UI, not swallowed
            return {"error": str(error)}

    # ---- search / replace -------------------------------------------------

    def search_workspace(self, query: str, match_case: bool) -> dict:
        if not query:
            return {"results": []}
        pattern = re.compile(re.escape(query), 0 if match_case else re.IGNORECASE)

        results = []
        scanned = 0
        for path in iter_workspace_files(self._workspace):
            scanned += 1
            if scanned > SEARCH_MAX_FILES_SCANNED:
                break
            try:
                text = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue

            matches = []
            for line_no, line in enumerate(text.splitlines(), start=1):
                match = pattern.search(line)
                if match:
                    matches.append(
                        {"line": line_no, "column": match.start(), "length": match.end() - match.start(), "preview": line.strip()}
                    )
                    if len(matches) >= SEARCH_MAX_MATCHES_PER_FILE:
                        break
            if matches:
                results.append({"path": str(path), "name": path.name, "matches": matches})
            if len(results) >= SEARCH_MAX_MATCHING_FILES:
                break

        return {"results": results}

    def replace_in_file(self, path: str, query: str, replacement: str, match_case: bool) -> dict:
        target = Path(path)
        if is_blocked_path(target):
            return {"error": "Editing inside codexdonottouch is blocked."}
        if not query:
            return {"replaced": 0}
        pattern = re.compile(re.escape(query), 0 if match_case else re.IGNORECASE)

        try:
            text = target.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError) as error:
            return {"error": str(error)}

        new_text, count = pattern.subn(replacement, text)
        if count == 0:
            return {"replaced": 0}
        try:
            target.write_text(new_text, encoding="utf-8")
        except OSError as error:
            return {"error": str(error)}

        return {"replaced": count, "content": new_text}

    # ---- workspace mutation -------------------------------------------------

    def create_folder(self, selected_path: str | None, name: str) -> dict:
        parent = self._selected_directory(selected_path)
        if is_blocked_path(parent):
            return {"error": "Creating folders inside codexdonottouch is blocked."}
        if any(separator in name for separator in ("/", "\\")):
            return {"error": "Folder names cannot contain slashes."}

        folder = parent / name
        if is_blocked_path(folder):
            return {"error": "That folder is blocked."}
        try:
            folder.mkdir()
        except FileExistsError:
            return {"error": "That folder already exists."}
        except OSError as error:
            return {"error": str(error)}

        self._pending_save_directory = folder
        return {}

    def create_file(self, parent_path: str | None, name: str) -> dict:
        parent = Path(parent_path) if parent_path else self._workspace
        if is_blocked_path(parent):
            return {"error": "Creating files inside codexdonottouch is blocked."}
        if any(separator in name for separator in ("/", "\\")):
            return {"error": "File names cannot contain slashes."}

        target = parent / name
        if is_blocked_path(target):
            return {"error": "That file name is blocked."}
        if target.exists():
            return {"error": "A file or folder with that name already exists."}
        try:
            target.write_text("", encoding="utf-8")
        except OSError as error:
            return {"error": str(error)}

        self._current_file = target
        self._pending_save_directory = parent
        display_path = str(target.relative_to(self._workspace)) if target.is_relative_to(self._workspace) else str(target)
        return {"path": str(target), "name": target.name, "content": "", "displayPath": display_path}

    def delete_file(self, path: str) -> dict:
        target = Path(path)
        if is_blocked_path(target):
            return {"error": "Deleting inside codexdonottouch is blocked."}
        is_dir = target.is_dir()
        try:
            if is_dir:
                shutil.rmtree(target)
            else:
                target.unlink()
        except OSError as error:
            return {"error": str(error)}

        if self._current_file and (self._current_file == target or target in self._current_file.parents):
            self._current_file = None
        return {"ok": True}

    def rename_path(self, old_path: str, new_name: str) -> dict:
        old = Path(old_path)
        if is_blocked_path(old):
            return {"error": "Renaming inside codexdonottouch is blocked."}
        if any(separator in new_name for separator in ("/", "\\")):
            return {"error": "Names cannot contain slashes."}

        new = old.parent / new_name
        if is_blocked_path(new):
            return {"error": "That name is blocked."}
        if new.exists():
            return {"error": "A file or folder with that name already exists."}
        try:
            old.rename(new)
        except OSError as error:
            return {"error": str(error)}

        if self._current_file == old:
            self._current_file = new
        return {"path": str(new), "name": new.name}

    def move_path(self, source_path: str, target_dir_path: str) -> dict:
        source = Path(source_path)
        target_dir = Path(target_dir_path)
        if is_blocked_path(source):
            return {"error": "Moving items inside codexdonottouch is blocked."}
        if is_blocked_path(target_dir):
            return {"error": "That destination is blocked."}
        if not target_dir.is_dir():
            return {"error": "You can only drop items onto a folder."}
        if source.parent == target_dir:
            return {"path": str(source), "name": source.name}
        if source == target_dir or target_dir.is_relative_to(source):
            return {"error": "Can't move a folder into itself."}

        destination = target_dir / source.name
        if is_blocked_path(destination):
            return {"error": "That destination is blocked."}
        if destination.exists():
            return {"error": "A file or folder with that name already exists there."}
        try:
            source.rename(destination)
        except OSError as error:
            return {"error": str(error)}

        if self._current_file and (self._current_file == source or source in self._current_file.parents):
            try:
                relative = self._current_file.relative_to(source)
                self._current_file = destination / relative
            except ValueError:
                self._current_file = destination

        return {"path": str(destination), "name": destination.name}

    def new_window(self) -> dict:
        try:
            new_api = Api()
            new_api._workspace = self._workspace
            window = webview.create_window(
                "Rhubarb IDE",
                str(DIST_INDEX),
                js_api=new_api,
                width=1320,
                height=820,
                min_size=(900, 600),
                background_color="#220817",
            )
            if window is None:
                return {"error": "Could not create a new window."}
            new_api._bind_window(window)
            return {"ok": True}
        except Exception as error:  # noqa: BLE001 - surfaced to the UI, not swallowed
            return {"error": str(error)}

    def _bind_window(self, window: webview.Window) -> None:
        self._window = window


def main() -> None:
    if not DIST_INDEX.exists():
        raise SystemExit(
            f"Built UI not found at {DIST_INDEX}.\n"
            "Run `npm install` and `npm run build` inside the webui/ folder first."
        )

    api = Api()
    window = webview.create_window(
        "Rhubarb IDE",
        str(DIST_INDEX),
        js_api=api,
        width=1320,
        height=820,
        min_size=(900, 600),
        background_color="#220817",
    )
    api._bind_window(window)
    webview.start()


if __name__ == "__main__":
    main()
