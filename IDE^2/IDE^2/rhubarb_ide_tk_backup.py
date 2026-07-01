#!/usr/bin/env python3
"""Tiny VS Code-style Rhubarb IDE."""

from __future__ import annotations

import ctypes
import subprocess
import sys
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, font as tkfont, messagebox, simpledialog, ttk

ROOT = Path(__file__).resolve().parent
RUNNER = ROOT / "rhubarb.py"
ASSETS = ROOT / "assets"
BLOCKED_DIR_NAMES = {"codexdonottouch"}

# Sora is the display face used for the big text on the website's hero
# section. The IDE bundles static instances and loads them privately
# (process-only, nothing touches the system font registry) so every UI
# label matches it. Actual code and terminal output stay monospaced.
FONT_UI = "Sora"
FONT_CODE = "Consolas"

COLORS = {
    "activity": "#4a1530",
    "sidebar": "#390e25",
    "panel": "#220817",
    "panel_2": "#170610",
    "terminal": "#120509",
    "border": "#5e1535",
    "text": "#fef3dc",
    "muted": "#b9889a",
    "accent": "#cb3661",
    "selection": "#6e1d3f",
    "error": "#ffb454",
    "button": "#4a1530",
    "button_hover": "#6e1d3f",
}


def _load_bundled_fonts() -> None:
    """Privately load the bundled Sora weights for this process only.

    Uses FR_PRIVATE so the font is never installed system-wide and is
    unloaded automatically when the process exits.
    """
    if sys.platform != "win32":
        return
    gdi32 = ctypes.WinDLL("gdi32")
    FR_PRIVATE = 0x10
    for filename in ("Sora-Regular.ttf", "Sora-Bold.ttf"):
        path = ASSETS / filename
        if path.exists():
            gdi32.AddFontResourceExW(str(path), FR_PRIVATE, 0)


def _rounded_points(x1: float, y1: float, x2: float, y2: float, radius: float) -> list[float]:
    radius = max(0, min(radius, (x2 - x1) / 2, (y2 - y1) / 2))
    return [
        x1 + radius, y1,
        x2 - radius, y1,
        x2, y1,
        x2, y1 + radius,
        x2, y2 - radius,
        x2, y2,
        x2 - radius, y2,
        x1 + radius, y2,
        x1, y2,
        x1, y2 - radius,
        x1, y1 + radius,
        x1, y1,
    ]


class RoundedButton(tk.Canvas):
    """A flat, pill-style button drawn on a canvas, in place of the
    sharp-cornered ttk/tk buttons used by the old VS Code-style look."""

    def __init__(
        self,
        parent: tk.Widget,
        text: str,
        command=None,
        *,
        canvas_bg: str,
        fill: str,
        fg: str,
        hover_fill: str | None = None,
        font: tuple = (FONT_UI, 11, "bold"),
        radius: int = 10,
        padx: int = 14,
        pady: int = 8,
    ) -> None:
        super().__init__(parent, highlightthickness=0, bg=canvas_bg, cursor="hand2")
        self._command = command
        self._fill = fill
        self._hover_fill = hover_fill or fill

        measurer = tkfont.Font(font=font)
        width = measurer.measure(text) + padx * 2
        height = measurer.metrics("linespace") + pady * 2
        self.configure(width=width, height=height)

        self._shape = self.create_polygon(
            _rounded_points(1, 1, width - 1, height - 1, radius),
            smooth=True,
            fill=fill,
            outline=fill,
        )
        self.create_text(width / 2, height / 2, text=text, fill=fg, font=font)

        self.bind("<Enter>", self._on_enter)
        self.bind("<Leave>", self._on_leave)
        self.bind("<Button-1>", self._on_click)

    def _on_enter(self, _event: tk.Event) -> None:
        self.itemconfig(self._shape, fill=self._hover_fill, outline=self._hover_fill)

    def _on_leave(self, _event: tk.Event) -> None:
        self.itemconfig(self._shape, fill=self._fill, outline=self._fill)

    def _on_click(self, _event: tk.Event) -> None:
        if self._command is not None:
            self._command()


class RoundedCard(tk.Frame):
    """A rounded-corner panel: a backdrop-colored frame with a canvas
    drawing a rounded card on top, and an inner frame inset within it for
    real content (text widgets, scrollbars, etc.) to be packed/gridded into."""

    def __init__(self, parent: tk.Widget, *, backdrop: str, card_bg: str, radius: int = 14, inset: int = 5) -> None:
        super().__init__(parent, bg=backdrop, highlightthickness=0)
        self._card_bg = card_bg
        self._radius = radius
        self._inset = inset

        self._canvas = tk.Canvas(self, bg=backdrop, highlightthickness=0)
        self._canvas.place(x=0, y=0, relwidth=1, relheight=1)
        self._canvas.bind("<Configure>", self._redraw)

        self.inner = tk.Frame(self, bg=card_bg, highlightthickness=0)
        self.inner.place(x=inset, y=inset, relwidth=1, relheight=1, width=-inset * 2, height=-inset * 2)

    def _redraw(self, event: tk.Event) -> None:
        self._canvas.delete("card")
        width, height = event.width, event.height
        if width > 4 and height > 4:
            points = _rounded_points(2, 2, width - 2, height - 2, self._radius)
            self._canvas.create_polygon(points, smooth=True, fill=self._card_bg, outline=self._card_bg, tags="card")


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


class RhubarbIDE(tk.Tk):
    def __init__(self) -> None:
        _load_bundled_fonts()
        super().__init__()
        self.title("Rhubarb IDE")
        self.geometry("1200x760")
        self.minsize(840, 560)

        self.workspace = ROOT
        self.current_file: Path | None = None
        self.pending_save_directory: Path | None = None
        self.open_file_items: dict[str, Path] = {}

        self._configure_style()
        self._build_layout()
        self._load_workspace_tree()
        self._set_editor_text(STARTER_CODE)
        self._set_status("Ready")

    def _configure_style(self) -> None:
        self.configure(bg=COLORS["panel"])
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure(".", background=COLORS["panel"], foreground=COLORS["text"], bordercolor=COLORS["border"], font=(FONT_UI, 11))
        style.configure("TFrame", background=COLORS["panel"])
        style.configure("Sidebar.TFrame", background=COLORS["sidebar"])
        style.configure("Activity.TFrame", background=COLORS["activity"])
        style.configure(
            "Treeview",
            background=COLORS["panel"],
            foreground=COLORS["text"],
            fieldbackground=COLORS["panel"],
            borderwidth=0,
            font=(FONT_UI, 11),
            rowheight=26,
        )
        style.map("Treeview", background=[("selected", COLORS["selection"])])
        style.configure("Treeview.Heading", background=COLORS["sidebar"], foreground=COLORS["muted"], borderwidth=0, font=(FONT_UI, 10, "bold"))
        style.configure("TPanedwindow", background=COLORS["panel_2"])
        style.configure("Sash", sashthickness=8, gripcount=0)
        style.configure(
            "Vertical.TScrollbar",
            background=COLORS["button"],
            troughcolor=COLORS["panel_2"],
            bordercolor=COLORS["panel_2"],
            arrowcolor=COLORS["muted"],
            relief=tk.FLAT,
        )
        style.map("Vertical.TScrollbar", background=[("active", COLORS["button_hover"])])
        style.configure(
            "Horizontal.TScrollbar",
            background=COLORS["button"],
            troughcolor=COLORS["panel_2"],
            bordercolor=COLORS["panel_2"],
            arrowcolor=COLORS["muted"],
            relief=tk.FLAT,
        )
        style.map("Horizontal.TScrollbar", background=[("active", COLORS["button_hover"])])
        style.configure("TLabel", background=COLORS["panel"], foreground=COLORS["text"], font=(FONT_UI, 11))

    def _build_layout(self) -> None:
        root = ttk.Frame(self)
        root.pack(fill=tk.BOTH, expand=True)

        activity = ttk.Frame(root, style="Activity.TFrame", width=48)
        activity.pack(side=tk.LEFT, fill=tk.Y)
        activity.pack_propagate(False)
        tk.Label(activity, text="RH", bg=COLORS["activity"], fg=COLORS["text"], font=(FONT_UI, 12, "bold")).pack(pady=(16, 10))
        tk.Label(activity, text="EX", bg=COLORS["activity"], fg=COLORS["text"], font=(FONT_UI, 12, "bold")).pack(pady=8)
        tk.Label(activity, text="RUN", bg=COLORS["activity"], fg=COLORS["text"], font=(FONT_UI, 10, "bold")).pack(pady=8)

        self.main_split = ttk.PanedWindow(root, orient=tk.HORIZONTAL)
        self.main_split.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        self._build_sidebar()
        self._build_workbench()

    def _build_sidebar(self) -> None:
        sidebar = ttk.Frame(self.main_split, style="Sidebar.TFrame", width=270)
        sidebar.pack_propagate(False)
        self.main_split.add(sidebar, weight=0)

        title = tk.Label(
            sidebar,
            text="EXPLORER",
            bg=COLORS["sidebar"],
            fg=COLORS["muted"],
            anchor="w",
            font=(FONT_UI, 11, "bold"),
            padx=12,
            pady=10,
        )
        title.pack(fill=tk.X)

        buttons = tk.Frame(sidebar, bg=COLORS["sidebar"])
        buttons.pack(fill=tk.X, padx=8, pady=(0, 8))
        self._sidebar_button(buttons, "Open Folder", self.choose_workspace).pack(side=tk.LEFT)
        self._sidebar_button(buttons, "Refresh", self._load_workspace_tree).pack(side=tk.LEFT, padx=(6, 0))
        actions = tk.Frame(sidebar, bg=COLORS["sidebar"])
        actions.pack(fill=tk.X, padx=8, pady=(0, 8))
        self._sidebar_button(actions, "New Folder", self.create_folder).pack(side=tk.LEFT)
        self._sidebar_button(actions, "Delete File", self.delete_selected_file).pack(side=tk.LEFT, padx=(6, 0))

        tree_card = RoundedCard(sidebar, backdrop=COLORS["sidebar"], card_bg=COLORS["panel"], radius=14)
        tree_card.pack(fill=tk.BOTH, expand=True, padx=8, pady=(0, 8))

        self.tree = ttk.Treeview(tree_card.inner, show="tree")
        self.tree.pack(fill=tk.BOTH, expand=True, padx=6, pady=6)
        self.tree.bind("<<TreeviewOpen>>", self._on_tree_open)
        self.tree.bind("<Double-1>", self._on_tree_double_click)

    def _build_workbench(self) -> None:
        workbench = ttk.Frame(self.main_split)
        self.main_split.add(workbench, weight=1)

        self.topbar = tk.Frame(workbench, bg=COLORS["panel_2"], height=38)
        self.topbar.pack(fill=tk.X)
        self.topbar.pack_propagate(False)

        self.tab_label = tk.Label(
            self.topbar,
            text="Untitled.rhubarb",
            bg=COLORS["panel_2"],
            fg=COLORS["text"],
            padx=14,
            pady=9,
            anchor="w",
            font=(FONT_UI, 12),
        )
        self.tab_label.pack(side=tk.LEFT)

        button_bar = tk.Frame(self.topbar, bg=COLORS["panel_2"])
        button_bar.pack(side=tk.RIGHT, padx=8, pady=6)
        self._top_button(button_bar, "New", self.new_file).pack(side=tk.LEFT, padx=3)
        self._top_button(button_bar, "Save", self.save_file).pack(side=tk.LEFT, padx=3)
        self._top_button(button_bar, "Run", self.run_file).pack(side=tk.LEFT, padx=3)
        self._top_button(button_bar, "Show Python", self.show_python).pack(side=tk.LEFT, padx=3)

        vertical = ttk.PanedWindow(workbench, orient=tk.VERTICAL)
        vertical.pack(fill=tk.BOTH, expand=True)

        editor_card = RoundedCard(vertical, backdrop=COLORS["panel_2"], card_bg=COLORS["panel"], radius=14)
        output_card = RoundedCard(vertical, backdrop=COLORS["panel_2"], card_bg=COLORS["panel"], radius=14)
        vertical.add(editor_card, weight=5)
        vertical.add(output_card, weight=1)
        editor_frame = editor_card.inner
        output_frame = output_card.inner

        self.editor = tk.Text(
            editor_frame,
            wrap="none",
            undo=True,
            font=(FONT_CODE, 14),
            bg=COLORS["panel"],
            fg=COLORS["text"],
            insertbackground=COLORS["text"],
            selectbackground=COLORS["selection"],
            padx=16,
            pady=14,
            relief=tk.FLAT,
        )
        editor_scroll_y = ttk.Scrollbar(editor_frame, orient=tk.VERTICAL, command=self.editor.yview)
        editor_scroll_x = ttk.Scrollbar(editor_frame, orient=tk.HORIZONTAL, command=self.editor.xview)
        self.editor.configure(yscrollcommand=editor_scroll_y.set, xscrollcommand=editor_scroll_x.set)
        self.editor.grid(row=0, column=0, sticky="nsew")
        editor_scroll_y.grid(row=0, column=1, sticky="ns")
        editor_scroll_x.grid(row=1, column=0, sticky="ew")
        editor_frame.rowconfigure(0, weight=1)
        editor_frame.columnconfigure(0, weight=1)

        output_title = tk.Label(
            output_frame,
            text="TERMINAL",
            bg=COLORS["panel"],
            fg=COLORS["muted"],
            anchor="w",
            font=(FONT_UI, 11, "bold"),
            padx=12,
            pady=8,
        )
        output_title.pack(fill=tk.X)
        self.output = tk.Text(
            output_frame,
            height=8,
            wrap="word",
            font=(FONT_CODE, 12),
            bg=COLORS["terminal"],
            fg=COLORS["text"],
            insertbackground=COLORS["text"],
            selectbackground=COLORS["selection"],
            padx=12,
            pady=10,
            relief=tk.FLAT,
        )
        self.output.pack(fill=tk.BOTH, expand=True, padx=8, pady=(0, 8))

        self.status = tk.StringVar()
        self.statusbar = tk.Label(
            workbench,
            textvariable=self.status,
            bg=COLORS["accent"],
            fg="white",
            anchor="w",
            padx=10,
            pady=3,
            font=(FONT_UI, 11),
        )
        self.statusbar.pack(fill=tk.X)

    def _top_button(self, parent: tk.Widget, text: str, command: object) -> RoundedButton:
        return RoundedButton(
            parent,
            text,
            command=command,
            canvas_bg=COLORS["panel_2"],
            fill=COLORS["button"],
            hover_fill=COLORS["button_hover"],
            fg=COLORS["text"],
            font=(FONT_UI, 11, "bold"),
            radius=9,
            padx=12,
            pady=6,
        )

    def _sidebar_button(self, parent: tk.Widget, text: str, command: object) -> RoundedButton:
        return RoundedButton(
            parent,
            text,
            command=command,
            canvas_bg=COLORS["sidebar"],
            fill=COLORS["button"],
            hover_fill=COLORS["button_hover"],
            fg=COLORS["text"],
            font=(FONT_UI, 10, "bold"),
            radius=8,
            padx=10,
            pady=5,
        )

    def _set_status(self, message: str) -> None:
        self.status.set(message)

    def _source(self) -> str:
        return self.editor.get("1.0", tk.END).rstrip() + "\n"

    def _set_editor_text(self, source: str) -> None:
        self.editor.delete("1.0", tk.END)
        self.editor.insert("1.0", source)

    def _is_blocked_path(self, path: Path) -> bool:
        return any(part in BLOCKED_DIR_NAMES for part in path.parts)

    def _display_name(self, path: Path) -> str:
        if path == self.workspace:
            return path.name
        return path.name + ("/" if path.is_dir() else "")

    def _load_workspace_tree(self) -> None:
        self.tree.delete(*self.tree.get_children())
        self.open_file_items.clear()
        root_id = self.tree.insert("", tk.END, text=self.workspace.name, open=True, values=(str(self.workspace),))
        self._populate_tree(root_id, self.workspace)
        self._set_status(f"Workspace: {self.workspace}")

    def _populate_tree(self, item_id: str, directory: Path) -> None:
        try:
            entries = sorted(directory.iterdir(), key=lambda path: (path.is_file(), path.name.lower()))
        except PermissionError:
            return

        for path in entries:
            if self._is_blocked_path(path) or path.name.startswith("."):
                continue
            child = self.tree.insert(item_id, tk.END, text=self._display_name(path), values=(str(path),))
            if path.is_dir():
                self.tree.insert(child, tk.END, text="loading", values=("__loading__",))
            else:
                self.open_file_items[child] = path

    def _on_tree_open(self, _event: tk.Event) -> None:
        item_id = self.tree.focus()
        path = self._tree_item_path(item_id)
        if path is None or not path.is_dir() or self._is_blocked_path(path):
            return

        children = self.tree.get_children(item_id)
        if len(children) == 1 and self.tree.item(children[0], "values") == ("__loading__",):
            self.tree.delete(children[0])
            self._populate_tree(item_id, path)

    def _on_tree_double_click(self, _event: tk.Event) -> None:
        item_id = self.tree.focus()
        path = self._tree_item_path(item_id)
        if path is None:
            return
        if path.is_dir():
            self.tree.item(item_id, open=not self.tree.item(item_id, "open"))
            self._on_tree_open(_event)
            return
        self.open_path(path)

    def _tree_item_path(self, item_id: str) -> Path | None:
        values = self.tree.item(item_id, "values")
        if not values or values[0] == "__loading__":
            return None
        return Path(values[0])

    def choose_workspace(self) -> None:
        folder = filedialog.askdirectory(title="Open Folder", initialdir=str(self.workspace))
        if not folder:
            return
        workspace = Path(folder)
        if self._is_blocked_path(workspace):
            messagebox.showerror("Rhubarb IDE", "That folder is blocked.")
            return
        self.workspace = workspace
        self._load_workspace_tree()

    def _selected_directory(self) -> Path:
        item_id = self.tree.focus()
        path = self._tree_item_path(item_id) if item_id else None
        if path is None:
            return self.workspace
        return path if path.is_dir() else path.parent

    def create_folder(self) -> None:
        parent = self._selected_directory()
        if self._is_blocked_path(parent):
            messagebox.showerror("Rhubarb IDE", "Creating folders inside codexdonottouch is blocked.")
            return
        name = simpledialog.askstring("New Folder", "Folder name:", parent=self)
        if not name:
            return
        if any(separator in name for separator in ("/", "\\")):
            messagebox.showerror("Rhubarb IDE", "Folder names cannot contain slashes.")
            return
        folder = parent / name
        if self._is_blocked_path(folder):
            messagebox.showerror("Rhubarb IDE", "That folder is blocked.")
            return
        try:
            folder.mkdir()
        except FileExistsError:
            messagebox.showerror("Rhubarb IDE", "That folder already exists.")
            return
        except OSError as error:
            messagebox.showerror("Rhubarb IDE", str(error))
            return
        self._load_workspace_tree()
        self.pending_save_directory = folder
        self._set_status(f"Created folder {folder.name}")

    def delete_selected_file(self) -> None:
        item_id = self.tree.focus()
        path = self._tree_item_path(item_id) if item_id else self.current_file
        if path is None:
            messagebox.showinfo("Rhubarb IDE", "Select a file first.")
            return
        if self._is_blocked_path(path):
            messagebox.showerror("Rhubarb IDE", "Deleting inside codexdonottouch is blocked.")
            return
        if path.is_dir():
            messagebox.showinfo("Rhubarb IDE", "Delete File only deletes files, not folders.")
            return
        if not messagebox.askyesno("Delete File", f"Delete {path.name}?"):
            return
        try:
            path.unlink()
        except OSError as error:
            messagebox.showerror("Rhubarb IDE", str(error))
            return
        if self.current_file == path:
            self.current_file = None
            self.tab_label.configure(text="Untitled.rhubarb")
            self._set_editor_text("")
        self._load_workspace_tree()
        self._set_status(f"Deleted {path.name}")

    def new_file(self) -> None:
        self.current_file = None
        self.pending_save_directory = self._selected_directory()
        self.tab_label.configure(text="Untitled.rhubarb")
        self._set_editor_text(STARTER_CODE)
        self.output.delete("1.0", tk.END)
        self._set_status(f"New Rhubarb file in {self.pending_save_directory.name}")

    def open_path(self, path: Path) -> None:
        if self._is_blocked_path(path):
            messagebox.showerror("Rhubarb IDE", "That file is blocked.")
            return
        try:
            source = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            messagebox.showerror("Rhubarb IDE", "This does not look like a text file.")
            return
        self.current_file = path
        self.pending_save_directory = path.parent
        self._set_editor_text(source)
        self.tab_label.configure(text=path.name)
        self._set_status(f"Opened {path.relative_to(self.workspace) if path.is_relative_to(self.workspace) else path}")

    def save_file(self) -> Path | None:
        if self.current_file is None:
            initial_directory = self.pending_save_directory or self._selected_directory()
            if self._is_blocked_path(initial_directory):
                initial_directory = self.workspace
            filename = filedialog.asksaveasfilename(
                title="Save Rhubarb file",
                initialdir=str(initial_directory),
                defaultextension=".rhubarb",
                filetypes=[("Rhubarb", "*.rhubarb"), ("Python", "*.py"), ("All files", "*.*")],
            )
            if not filename:
                return None
            self.current_file = Path(filename)
            self.pending_save_directory = self.current_file.parent

        if self._is_blocked_path(self.current_file):
            messagebox.showerror("Rhubarb IDE", "Saving inside codexdonottouch is blocked.")
            return None

        self.current_file.write_text(self._source(), encoding="utf-8")
        self.tab_label.configure(text=self.current_file.name)
        self._load_workspace_tree()
        self._set_status(f"Saved {self.current_file.name}")
        return self.current_file

    def run_file(self) -> None:
        path = self.save_file()
        if path is None:
            return
        if self._is_blocked_path(path):
            messagebox.showerror("Rhubarb IDE", "Running files inside codexdonottouch is blocked.")
            return

        command = [sys.executable, str(path)] if path.suffix == ".py" else [sys.executable, str(RUNNER), str(path)]
        self.output.delete("1.0", tk.END)
        self._set_status(f"Running {path.name}")
        completed = subprocess.run(command, capture_output=True, text=True, cwd=str(path.parent))
        text = completed.stdout
        if completed.stderr:
            text += ("\n" if text else "") + completed.stderr
        if not text:
            text = f"Finished with exit code {completed.returncode}."
        self.output.insert("1.0", text)
        if completed.returncode:
            self.output.tag_configure("error", foreground=COLORS["error"])
            self.output.tag_add("error", "1.0", tk.END)
        self._set_status(f"Finished {path.name} with exit code {completed.returncode}")

    def show_python(self) -> None:
        import rhubarb

        try:
            translated = rhubarb.translate(self._source())
        except Exception as error:
            messagebox.showerror("Rhubarb", str(error))
            return

        preview = tk.Toplevel(self)
        preview.title("Translated Python")
        preview.geometry("850x560")
        preview.configure(bg=COLORS["panel"])
        text = tk.Text(
            preview,
            wrap="none",
            font=("Consolas", 13),
            bg=COLORS["panel"],
            fg=COLORS["text"],
            insertbackground=COLORS["text"],
            padx=12,
            pady=12,
            relief=tk.FLAT,
        )
        text.pack(fill=tk.BOTH, expand=True)
        text.insert("1.0", translated)


if __name__ == "__main__":
    RhubarbIDE().mainloop()
