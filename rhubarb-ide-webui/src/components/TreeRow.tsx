import { useRef, useState } from "react";
import type { PendingCreate, TreeNode } from "../types";
import { isPrivateDialectPath, resolveDropTarget } from "../lib/paths";
import FileIcon from "./FileIcon";
import TreeCreateRow from "./TreeCreateRow";

interface TreeRowProps {
  node: TreeNode;
  depth: number;
  expandedPaths: Set<string>;
  childrenByPath: Record<string, TreeNode[]>;
  selectedPath: string | null;
  loadingPaths: Set<string>;
  onToggle: (node: TreeNode) => void;
  onSelectFile: (node: TreeNode) => void;
  onContextMenu: (node: TreeNode, x: number, y: number) => void;
  pendingCreate: PendingCreate | null;
  onCommitCreate: (name: string) => void;
  onCancelCreate: () => void;
  draggingPath: string | null;
  onDragStartNode: (node: TreeNode) => void;
  onDragEndNode: () => void;
  onDropNode: (target: TreeNode) => void;
}

export default function TreeRow({
  node,
  depth,
  expandedPaths,
  childrenByPath,
  selectedPath,
  loadingPaths,
  onToggle,
  onSelectFile,
  onContextMenu,
  pendingCreate,
  onCommitCreate,
  onCancelCreate,
  draggingPath,
  onDragStartNode,
  onDragEndNode,
  onDropNode,
}: TreeRowProps) {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const children = childrenByPath[node.path];
  const isCreatingHere = node.isDir && pendingCreate?.parentPath === node.path;
  const isBeingDragged = draggingPath === node.path;
  const canDrop = draggingPath !== null && resolveDropTarget(draggingPath, node) !== null;
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  const isPrivateDialect = !node.isDir && node.name.toLowerCase().endsWith(".rhubarb") && isPrivateDialectPath(node.path);

  return (
    <div>
      <div
        draggable={depth > 0}
        title={isPrivateDialect ? "Private dialect — needs the matching key to run" : undefined}
        onClick={() => (node.isDir ? onToggle(node) : onSelectFile(node))}
        onContextMenu={(event) => {
          event.preventDefault();
          onContextMenu(node, event.clientX, event.clientY);
        }}
        onDragStart={(event) => {
          event.stopPropagation();
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", node.path);
          onDragStartNode(node);
        }}
        onDragEnd={(event) => {
          event.stopPropagation();
          dragCounter.current = 0;
          setIsDragOver(false);
          onDragEndNode();
        }}
        onDragEnter={(event) => {
          event.stopPropagation();
          if (!canDrop) return;
          event.preventDefault();
          dragCounter.current += 1;
          setIsDragOver(true);
        }}
        onDragOver={(event) => {
          event.stopPropagation();
          if (!canDrop) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onDragLeave={(event) => {
          event.stopPropagation();
          if (!canDrop) return;
          dragCounter.current -= 1;
          if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsDragOver(false);
          }
        }}
        onDrop={(event) => {
          event.stopPropagation();
          if (!canDrop) return;
          event.preventDefault();
          dragCounter.current = 0;
          setIsDragOver(false);
          onDropNode(node);
        }}
        className={`flex cursor-pointer items-center gap-1.5 rounded-md py-1 pr-2 text-sm transition-colors ${
          isDragOver && canDrop
            ? "bg-leaf-500/30 ring-1 ring-inset ring-leaf-400"
            : isSelected
              ? "bg-rhubarb-700 text-custard-50"
              : "text-custard-100/85 hover:bg-rhubarb-800/60"
        } ${isBeingDragged ? "opacity-40" : ""}`}
        style={{ paddingLeft: 10 + depth * 16 }}
      >
        {node.isDir ? (
          <span
            className={`inline-block w-3 flex-shrink-0 text-[10px] text-custard-100/50 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            ▸
          </span>
        ) : (
          <span className="inline-block w-3 flex-shrink-0" />
        )}
        {!node.isDir && <FileIcon name={node.name} path={node.path} />}
        <span className="truncate font-mono text-[13px]">{node.name}</span>
        {loadingPaths.has(node.path) && (
          <span className="ml-auto text-[10px] text-custard-100/40">…</span>
        )}
      </div>

      {node.isDir && isExpanded && (children || isCreatingHere) && (
        <div>
          {isCreatingHere && (
            <TreeCreateRow
              depth={depth + 1}
              kind={pendingCreate!.kind}
              onCommit={onCommitCreate}
              onCancel={onCancelCreate}
            />
          )}
          {(children ?? []).length === 0 && !isCreatingHere ? (
            <div
              onDragEnter={(event) => {
                event.stopPropagation();
                if (!canDrop) return;
                event.preventDefault();
                dragCounter.current += 1;
                setIsDragOver(true);
              }}
              onDragOver={(event) => {
                event.stopPropagation();
                if (!canDrop) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDragLeave={(event) => {
                event.stopPropagation();
                if (!canDrop) return;
                dragCounter.current -= 1;
                if (dragCounter.current <= 0) {
                  dragCounter.current = 0;
                  setIsDragOver(false);
                }
              }}
              onDrop={(event) => {
                event.stopPropagation();
                if (!canDrop) return;
                event.preventDefault();
                dragCounter.current = 0;
                setIsDragOver(false);
                onDropNode(node);
              }}
              className={`py-0.5 text-xs text-custard-100/30 ${isDragOver && canDrop ? "bg-leaf-500/20" : ""}`}
              style={{ paddingLeft: 10 + (depth + 1) * 16 }}
            >
              empty
            </div>
          ) : (
            (children ?? []).map((child) => (
              <TreeRow
                key={child.path}
                node={child}
                depth={depth + 1}
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
