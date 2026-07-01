import { useRef, useState } from "react";
import type { PendingCreate, SearchMatch, TreeNode } from "../types";
import IconButton from "./IconButton";
import { FolderIcon, FileIconGlyph, SearchIcon, KeyIcon } from "./icons/ToolbarIcons";
import TreeRow from "./TreeRow";
import SearchPanel from "./SearchPanel";

interface SidebarProps {
  workspaceLabel: string;
  root: TreeNode | null;
  expandedPaths: Set<string>;
  childrenByPath: Record<string, TreeNode[]>;
  selectedPath: string | null;
  loadingPaths: Set<string>;
  onToggle: (node: TreeNode) => void;
  onSelectFile: (node: TreeNode) => void;
  onContextMenu: (node: TreeNode, x: number, y: number) => void;
  onAddFolder: () => void;
  onAddFile: () => void;
  onOpenFolder: () => void;
  onOpenFile: () => void;
  searchOpen: boolean;
  onToggleSearch: () => void;
  onOpenMatch: (path: string, match: SearchMatch) => void;
  pendingCreate: PendingCreate | null;
  onCommitCreate: (name: string) => void;
  onCancelCreate: () => void;
  draggingPath: string | null;
  onDragStartNode: (node: TreeNode) => void;
  onDragEndNode: () => void;
  onDropNode: (target: TreeNode) => void;
  keysLoaded: boolean;
  onOpenKeys: () => void;
}

export default function Sidebar({
  workspaceLabel,
  root,
  expandedPaths,
  childrenByPath,
  selectedPath,
  loadingPaths,
  onToggle,
  onSelectFile,
  onContextMenu,
  onAddFolder,
  onAddFile,
  onOpenFolder,
  onOpenFile,
  searchOpen,
  onToggleSearch,
  onOpenMatch,
  pendingCreate,
  onCommitCreate,
  onCancelCreate,
  draggingPath,
  onDragStartNode,
  onDragEndNode,
  onDropNode,
  keysLoaded,
  onOpenKeys,
}: SidebarProps) {
  const [isRootDragOver, setIsRootDragOver] = useState(false);
  const rootDragCounter = useRef(0);

  return (
    <div className="flex w-64 flex-shrink-0 flex-col bg-rhubarb-900">
      <p className="font-display px-3 pb-2 pt-3 text-[11px] font-bold tracking-wider text-custard-100/50">
        {searchOpen ? "SEARCH" : "EXPLORER"}
      </p>

      <div className="flex gap-1.5 px-2 pb-2">
        <IconButton onClick={onAddFolder} title="New Folder">
          <FolderIcon withPlus />
        </IconButton>
        <IconButton onClick={onAddFile} title="New File">
          <FileIconGlyph withPlus />
        </IconButton>
        <IconButton onClick={onOpenFolder} title="Open Folder (Ctrl+Shift+O)">
          <FolderIcon />
        </IconButton>
        <IconButton onClick={onOpenFile} title="Open File (Ctrl+O)">
          <FileIconGlyph />
        </IconButton>
        <IconButton
          onClick={onToggleSearch}
          title="Search (Ctrl+Shift+F)"
          variant={searchOpen ? "primary" : "ghost"}
        >
          <SearchIcon />
        </IconButton>
        <IconButton
          onClick={onOpenKeys}
          title="Custom Rhubarb Keys"
          variant={keysLoaded ? "primary" : "ghost"}
        >
          <KeyIcon />
        </IconButton>
      </div>

      {searchOpen ? (
        <SearchPanel onOpenMatch={onOpenMatch} />
      ) : (
        <div
          className={`mx-2 mb-2 flex-1 overflow-y-auto rounded-xl bg-rhubarb-950 p-1.5 ${
            isRootDragOver ? "ring-1 ring-inset ring-leaf-400" : ""
          }`}
          onDragEnter={(event) => {
            if (!draggingPath || !root) return;
            event.preventDefault();
            rootDragCounter.current += 1;
            setIsRootDragOver(true);
          }}
          onDragOver={(event) => {
            if (!draggingPath) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onDragLeave={() => {
            if (!draggingPath) return;
            rootDragCounter.current -= 1;
            if (rootDragCounter.current <= 0) {
              rootDragCounter.current = 0;
              setIsRootDragOver(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            rootDragCounter.current = 0;
            setIsRootDragOver(false);
            if (draggingPath && root) onDropNode(root);
          }}
        >
          {root ? (
            <TreeRow
              node={root}
              depth={0}
              expandedPaths={expandedPaths}
              childrenByPath={childrenByPath}
              selectedPath={selectedPath}
              loadingPaths={loadingPaths}
              onToggle={onToggle}
              onSelectFile={onSelectFile}
              onContextMenu={onContextMenu}
              pendingCreate={pendingCreate}
              onCommitCreate={onCommitCreate}
              onCancelCreate={onCancelCreate}
              draggingPath={draggingPath}
              onDragStartNode={onDragStartNode}
              onDragEndNode={onDragEndNode}
              onDropNode={onDropNode}
            />
          ) : (
            <p className="p-3 text-xs text-custard-100/40">{workspaceLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
