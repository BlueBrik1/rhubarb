#!/usr/bin/env python3
"""Rhubarb IDE — a React + Tailwind UI over the same file/run/translate
logic the old Tkinter IDE used. The UI talks to this process over
pywebview's JS bridge; nothing about how a .rhubarb file is opened,
saved, run, or translated to Python has changed."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import webview

import rhubarb
import rhubarb_encode
import rhubarb_keys

ROOT = Path(__file__).resolve().parent
RUNNER = ROOT / "rhubarb.py"
DIST_INDEX = ROOT.parent.parent / "rhubarb-ide-webui" / "dist" / "index.html"
BLOCKED_DIR_NAMES = {"codexdonottouch"}
SEARCH_SKIP_DIR_NAMES = BLOCKED_DIR_NAMES | {"node_modules", "__pycache__", ".git", "dist", "build"}
SEARCH_MAX_FILES_SCANNED = 5000
SEARCH_MAX_MATCHING_FILES = 200
SEARCH_MAX_MATCHES_PER_FILE = 50
KEYS_FILENAME = ".rhubarb_keys.json"
MIRROR_SUFFIX = "-rhubarb"

STARTER_CODE = (
    "# Rhubarb is based on Python.\n"
    "# You can write normal Python, plus these shortcuts:\n"
    "#   say \"hello\"\n"
    "#   set name = \"Mihir\"\n"
    "#   repeat 3:\n"
    "#\n"
    "# Every space above is only legal inside a comment like this one.\n"
    "# In real code, the mandatory space character ꧃ replaces every\n"
    "# ordinary space and tab, including indentation.\n"
    "\n"
    "say꧃\"Hello from Rhubarb!\"\n"
    "\n"
    "set꧃language꧃=꧃\"Python-powered\"\n"
    "say꧃f\"Rhubarb is {language}.\"\n"
    "\n"
    "repeat꧃3:\n"
    "꧃꧃꧃꧃say꧃\"rhubarb!\"\n"
)


def is_blocked_path(path: Path) -> bool:
    return any(part in BLOCKED_DIR_NAMES for part in path.parts)


def is_private_dialect_path(path: Path) -> bool:
    """A .rhubarb file counts as private-dialect if it lives anywhere
    inside a "<name>-rhubarb" mirror folder produced by /mirror."""
    return any(part.endswith(MIRROR_SUFFIX) for part in path.parts[:-1])


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
        self._key: str | None = None
        self._terminal_cwd: Path = self._workspace
        self._load_keys()

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
        self._terminal_cwd = self._workspace
        self._load_keys()
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

        if target.suffix == ".rhubarb" and is_private_dialect_path(target):
            python_source, error = self._decode_private_dialect(content)
            if error:
                return {"error": error}
            command = [sys.executable, "-c", python_source]
        elif target.suffix == ".py":
            command = [sys.executable, str(target)]
        else:
            command = [sys.executable, str(RUNNER), str(target)]

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

    def show_python(self, path: str | None, content: str) -> dict:
        if path and Path(path).suffix == ".rhubarb" and is_private_dialect_path(Path(path)):
            python_source, error = self._decode_private_dialect(content)
            if error:
                return {"error": error}
            return {"python": python_source}
        try:
            return {"python": rhubarb.translate(content)}
        except Exception as error:  # noqa: BLE001 - surfaced to the UI, not swallowed
            return {"error": str(error)}

    # ---- key (symmetric) ----------------------------------------------------
    #
    # A single key derives a private Rhubarb vocabulary (see rhubarb_keys.py).
    # The cipher is fully symmetric: whichever key encoded a file is the only
    # key that decodes it back — the same key does both jobs. /mirror needs
    # that key loaded to encode; running/previewing a private-dialect
    # .rhubarb file needs that same key loaded to decode. A different key
    # never recovers the original Python.

    def generate_keys(self) -> dict:
        return {"key": rhubarb_keys.generate_key()}

    def get_keys_status(self) -> dict:
        return {"hasKey": bool(self._key)}

    def reveal_keys(self) -> dict:
        return {"key": self._key}

    def save_keys(self, key: str) -> dict:
        keys_file = self._workspace / KEYS_FILENAME
        try:
            keys_file.write_text(json.dumps({"key": key}), encoding="utf-8")
        except OSError as error:
            return {"error": str(error)}
        self._key = key or None
        return self.get_keys_status()

    def clear_keys(self) -> dict:
        keys_file = self._workspace / KEYS_FILENAME
        try:
            if keys_file.exists():
                keys_file.unlink()
        except OSError as error:
            return {"error": str(error)}
        self._key = None
        return {"ok": True}

    def _load_keys(self) -> None:
        self._key = None
        keys_file = self._workspace / KEYS_FILENAME
        if not keys_file.exists():
            return
        try:
            data = json.loads(keys_file.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return
        # Older workspaces may still have a two-key {"keyA"/"keyB"} or
        # {"publicKey"/"privateKey"} file from before this was a single
        # symmetric key; whichever of those was the "encoding" key becomes
        # the one key going forward.
        self._key = data.get("key") or data.get("publicKey") or data.get("keyA") or None

    def _decode_private_dialect(self, content: str) -> tuple[str | None, str | None]:
        if not self._key:
            return None, "A key is required to run a private-dialect Rhubarb file. Open the Keys panel."
        try:
            tokens = rhubarb_keys.derive_token_set(self._key)
            return rhubarb.translate(content, tokens=tokens), None
        except Exception as error:  # noqa: BLE001 - surfaced to the UI, not swallowed
            return None, str(error)

    # ---- terminal -----------------------------------------------------------
    #
    # A minimal interactive terminal: arbitrary shell commands run via
    # subprocess in the tracked current directory, except "cd" (handled
    # locally so the directory persists between calls) and "/mirror" (the
    # one special command — it never decodes Rhubarb back to Python, only
    # ever encodes every .py file under the current directory into a
    # sibling "<dirname>-rhubarb" folder using the loaded key).

    def get_terminal_cwd(self) -> dict:
        return {"cwd": str(self._terminal_cwd)}

    def terminal_run(self, cwd: str, command: str) -> dict:
        current = Path(cwd) if cwd else self._terminal_cwd
        if not current.is_dir():
            current = self._workspace
        command = command.strip()

        if not command:
            return {"cwd": str(current), "output": "", "isError": False}

        if command == "/mirror":
            self._terminal_cwd = current
            output, is_error = self._mirror_directory(current)
            return {"cwd": str(current), "output": output, "isError": is_error}

        if command == "cd" or command.startswith("cd "):
            remainder = command[2:].strip()
            return self._terminal_cd(current, remainder)

        self._terminal_cwd = current
        try:
            completed = subprocess.run(command, shell=True, cwd=str(current), capture_output=True, text=True)
        except OSError as error:
            return {"cwd": str(current), "output": str(error), "isError": True}

        text = completed.stdout
        if completed.stderr:
            text += ("\n" if text else "") + completed.stderr
        return {"cwd": str(current), "output": text, "isError": bool(completed.returncode)}

    def _terminal_cd(self, current: Path, remainder: str) -> dict:
        if not remainder:
            target = self._workspace
        else:
            stripped = remainder.strip("\"'")
            candidate = Path(stripped)
            target = candidate if candidate.is_absolute() else current / stripped
            target = target.resolve()

        if is_blocked_path(target):
            return {"cwd": str(current), "output": "That directory is blocked.", "isError": True}
        if not target.is_dir():
            return {"cwd": str(current), "output": f"No such directory: {remainder}", "isError": True}

        self._terminal_cwd = target
        return {"cwd": str(target), "output": "", "isError": False}

    def _mirror_directory(self, directory: Path) -> tuple[str, bool]:
        if is_blocked_path(directory):
            return "That directory is blocked.", True
        if not self._key:
            return "No key loaded. Open the Keys panel and save a key first.", True

        tokens = rhubarb_keys.derive_token_set(self._key)
        mirror_dir = directory.parent / f"{directory.name}{MIRROR_SUFFIX}"

        try:
            mirror_dir.mkdir(parents=True, exist_ok=True)
        except OSError as error:
            return str(error), True

        mirrored = 0
        skipped: list[str] = []
        for python_path in iter_workspace_files(directory):
            if python_path.suffix != ".py":
                continue
            relative = python_path.relative_to(directory)
            destination = (mirror_dir / relative).with_suffix(".rhubarb")
            try:
                source = python_path.read_text(encoding="utf-8")
                encoded = rhubarb_encode.encode_python_to_rhubarb(source, tokens)
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_text(encoded, encoding="utf-8")
                mirrored += 1
            except (rhubarb_encode.EncodeError, OSError, UnicodeDecodeError) as error:
                skipped.append(f"{relative}: {error}")

        lines = [f"Mirrored {mirrored} Python file(s) to {mirror_dir.name}/"]
        if skipped:
            lines.append(f"Skipped {len(skipped)} file(s):")
            lines.extend(f"  {entry}" for entry in skipped)
        return "\n".join(lines), False

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
            new_api._terminal_cwd = self._workspace
            new_api._load_keys()
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
