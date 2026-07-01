import type {
  KeyResult,
  KeysStatus,
  MoveResult,
  NewFileResult,
  OpenFileResult,
  PythonPreviewResult,
  RenameResult,
  ReplaceResult,
  RunResult,
  SaveKeysResult,
  SaveResult,
  SearchResponse,
  TerminalResult,
  TreeNode,
  WorkspaceResult,
} from "../types";

declare global {
  interface Window {
    pywebview?: {
      api: {
        list_workspace(): Promise<WorkspaceResult>;
        list_dir(path: string): Promise<TreeNode[]>;
        open_file(path: string): Promise<OpenFileResult>;
        open_file_dialog(): Promise<OpenFileResult | { cancelled: true }>;
        new_file_content(selectedPath: string | null): Promise<NewFileResult>;
        save_file(path: string | null, content: string): Promise<SaveResult>;
        run_file(path: string | null, content: string): Promise<RunResult>;
        show_python(path: string | null, content: string): Promise<PythonPreviewResult>;
        choose_workspace(): Promise<WorkspaceResult | { cancelled: true }>;
        create_folder(selectedPath: string | null, name: string): Promise<{ error?: string }>;
        create_file(parentPath: string | null, name: string): Promise<OpenFileResult>;
        delete_file(path: string): Promise<{ ok?: boolean; error?: string }>;
        rename_path(oldPath: string, newName: string): Promise<RenameResult>;
        move_path(sourcePath: string, targetDirPath: string): Promise<MoveResult>;
        new_window(): Promise<{ ok?: boolean; error?: string }>;
        search_workspace(query: string, matchCase: boolean): Promise<SearchResponse>;
        replace_in_file(path: string, query: string, replacement: string, matchCase: boolean): Promise<ReplaceResult>;
        generate_keys(): Promise<KeyResult>;
        get_keys_status(): Promise<KeysStatus>;
        reveal_keys(): Promise<KeyResult>;
        save_keys(key: string): Promise<SaveKeysResult>;
        clear_keys(): Promise<{ ok?: boolean; error?: string }>;
        get_terminal_cwd(): Promise<{ cwd: string }>;
        terminal_run(cwd: string, command: string): Promise<TerminalResult>;
      };
    };
  }
}

let readyPromise: Promise<void> | null = null;

function bridgeIsUsable(): boolean {
  return typeof window.pywebview?.api?.list_workspace === "function";
}

// pywebview injects window.pywebview asynchronously, after this page's own
// scripts start running, and window.pywebview itself can exist slightly
// before its .api methods are attached. The "pywebviewready" event can also
// fire before our own listener attaches (this is a fast-loading local
// bundle, not a network-fetched page), so poll for an actual bridge method
// instead of relying on a one-shot event or object presence alone.
export function whenReady(): Promise<void> {
  if (bridgeIsUsable()) return Promise.resolve();
  if (!readyPromise) {
    readyPromise = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (bridgeIsUsable()) {
          clearInterval(interval);
          resolve();
        }
      }, 30);
    });
  }
  return readyPromise;
}

function bridge() {
  if (!window.pywebview) {
    throw new Error(
      "pywebview bridge is not available. Run this UI inside the Rhubarb IDE, not a plain browser."
    );
  }
  return window.pywebview.api;
}

export const api = {
  listWorkspace: () => bridge().list_workspace(),
  listDir: (path: string) => bridge().list_dir(path),
  openFile: (path: string) => bridge().open_file(path),
  openFileDialog: () => bridge().open_file_dialog(),
  newFileContent: (selectedPath: string | null) => bridge().new_file_content(selectedPath),
  saveFile: (path: string | null, content: string) => bridge().save_file(path, content),
  runFile: (path: string | null, content: string) => bridge().run_file(path, content),
  showPython: (path: string | null, content: string) => bridge().show_python(path, content),
  chooseWorkspace: () => bridge().choose_workspace(),
  createFolder: (selectedPath: string | null, name: string) => bridge().create_folder(selectedPath, name),
  createFile: (parentPath: string | null, name: string) => bridge().create_file(parentPath, name),
  deleteFile: (path: string) => bridge().delete_file(path),
  renamePath: (oldPath: string, newName: string) => bridge().rename_path(oldPath, newName),
  movePath: (sourcePath: string, targetDirPath: string) => bridge().move_path(sourcePath, targetDirPath),
  newWindow: () => bridge().new_window(),
  searchWorkspace: (query: string, matchCase: boolean) => bridge().search_workspace(query, matchCase),
  replaceInFile: (path: string, query: string, replacement: string, matchCase: boolean) =>
    bridge().replace_in_file(path, query, replacement, matchCase),
  generateKeys: () => bridge().generate_keys(),
  getKeysStatus: () => bridge().get_keys_status(),
  revealKeys: () => bridge().reveal_keys(),
  saveKeys: (key: string) => bridge().save_keys(key),
  clearKeys: () => bridge().clear_keys(),
  getTerminalCwd: () => bridge().get_terminal_cwd(),
  terminalRun: (cwd: string, command: string) => bridge().terminal_run(cwd, command),
};
