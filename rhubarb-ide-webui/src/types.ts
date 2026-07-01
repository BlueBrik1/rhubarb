export interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  hasChildren: boolean;
  children?: TreeNode[];
}

export interface OpenFileResult {
  path: string;
  name: string;
  content: string;
  displayPath: string;
  error?: string;
}

export interface SaveResult {
  path?: string;
  name?: string;
  cancelled?: boolean;
  error?: string;
}

export interface RunResult {
  output: string;
  exitCode: number;
  isError: boolean;
  path?: string;
  name?: string;
  error?: string;
}

export interface PythonPreviewResult {
  python?: string;
  error?: string;
}

export interface WorkspaceResult {
  workspaceName: string;
  tree: TreeNode;
}

export interface NewFileResult {
  content: string;
  directoryName: string;
}

export interface RenameResult {
  path?: string;
  name?: string;
  error?: string;
}

export interface MoveResult {
  path?: string;
  name?: string;
  error?: string;
}

export interface EditorTab {
  id: string; // real file path once saved, else "untitled:<n>"
  path: string | null;
  name: string;
  content: string; // live buffer
  savedContent: string; // baseline at last load/save; dirty = content !== savedContent
}

export interface SearchMatch {
  line: number;
  column: number;
  length: number;
  preview: string;
}

export interface SearchFileResult {
  path: string;
  name: string;
  matches: SearchMatch[];
}

export interface SearchResponse {
  results?: SearchFileResult[];
  error?: string;
}

export interface ReplaceResult {
  replaced?: number;
  content?: string;
  error?: string;
}

export interface ScrollTarget {
  line: number;
  column: number;
  length: number;
  nonce: number;
}

export interface PendingCreate {
  parentPath: string;
  kind: "file" | "folder";
}

export interface KeyResult {
  key?: string;
  error?: string;
}

export interface KeysStatus {
  hasKey: boolean;
}

export interface SaveKeysResult {
  hasKey?: boolean;
  error?: string;
}

export interface TerminalResult {
  cwd: string;
  output: string;
  isError: boolean;
}

export interface TerminalEntry {
  cwd: string;
  command: string;
  output: string;
  isError: boolean;
}
