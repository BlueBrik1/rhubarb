import type { TreeNode } from "../types";

export function parentPathOf(fullPath: string): string {
  const idx = Math.max(fullPath.lastIndexOf("\\"), fullPath.lastIndexOf("/"));
  return idx === -1 ? fullPath : fullPath.slice(0, idx);
}

export function isPathInside(path: string, dir: string): boolean {
  return path === dir || path.startsWith(dir + "\\") || path.startsWith(dir + "/");
}

// Resolves which directory a drop onto `target` should land in — dropping
// onto a file (like most real IDEs) targets that file's containing folder —
// or null if dropping `draggingPath` there isn't a valid move.
export function resolveDropTarget(draggingPath: string, target: TreeNode): string | null {
  const targetDir = target.isDir ? target.path : parentPathOf(target.path);
  if (isPathInside(targetDir, draggingPath)) return null;
  if (parentPathOf(draggingPath) === targetDir) return null;
  return targetDir;
}
