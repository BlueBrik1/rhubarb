import type { TreeNode } from "../types";

const MIRROR_SUFFIX = "-rhubarb";

// Mirrors the backend's is_private_dialect_path: a .rhubarb file counts as
// private-dialect if it lives anywhere inside a "<name>-rhubarb" mirror
// folder produced by /mirror, as opposed to an ordinary public-dialect
// .rhubarb file elsewhere in the workspace.
export function isPrivateDialectPath(path: string): boolean {
  const segments = path.split(/[\\/]/);
  segments.pop();
  return segments.some((segment) => segment.endsWith(MIRROR_SUFFIX));
}

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
