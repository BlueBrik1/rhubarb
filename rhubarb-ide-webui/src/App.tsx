import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Editor from "./components/Editor";
import Output from "./components/Output";
import StatusBar from "./components/StatusBar";
import PythonPreviewModal from "./components/PythonPreviewModal";
import ConfirmCloseModal from "./components/ConfirmCloseModal";
import ConfirmModal from "./components/ConfirmModal";
import ContextMenu from "./components/ContextMenu";
import { api, whenReady } from "./lib/api";
import { isPathInside, parentPathOf, resolveDropTarget } from "./lib/paths";
import type { EditorTab, PendingCreate, ScrollTarget, SearchMatch, TreeNode } from "./types";

export default function App() {
  const [workspaceLabel, setWorkspaceLabel] = useState("Loading workspace…");
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [childrenByPath, setChildrenByPath] = useState<Record<string, TreeNode[]>>({});
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<TreeNode | null>(null);

  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(null);
  const untitledCounter = useRef(0);

  const [output, setOutput] = useState("");
  const [outputIsError, setOutputIsError] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [pythonPreview, setPythonPreview] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ node: TreeNode; x: number; y: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<ScrollTarget | null>(null);
  const scrollNonce = useRef(0);
  const [pendingCreate, setPendingCreate] = useState<PendingCreate | null>(null);
  const [pendingDeleteNode, setPendingDeleteNode] = useState<TreeNode | null>(null);
  const [draggingPath, setDraggingPath] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;

  // Clicking anywhere outside the file tree/sidebar clears the selection
  // highlight — left-click only, so right-clicking to open the context menu
  // doesn't wipe out the node it's about to act on.
  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (event.button !== 0) return;
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSelected(null);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // ---- workspace tree ---------------------------------------------------

  function applyWorkspace(result: { workspaceName: string; tree: TreeNode }) {
    setRoot(result.tree);
    setWorkspaceLabel(result.workspaceName);
    setSelected(null);
    setExpandedPaths(new Set([result.tree.path]));
    setChildrenByPath({ [result.tree.path]: result.tree.children ?? [] });
    setStatus(`Workspace: ${result.workspaceName}`);
  }

  async function loadWorkspace() {
    try {
      const result = await api.listWorkspace();
      applyWorkspace(result);
    } catch (err) {
      setWorkspaceLabel("Workspace failed to load");
      setStatus(err instanceof Error ? err.message : String(err));
    }
  }

  // Refreshes tree *contents* (after a save/run/create/delete/rename) without
  // resetting expandedPaths — unlike applyWorkspace, which is only for a
  // genuine workspace switch. Re-fetches the root plus every directory the
  // user currently has expanded, so nothing that was open collapses.
  async function refreshTree() {
    try {
      const result = await api.listWorkspace();
      setRoot(result.tree);
      setWorkspaceLabel(result.workspaceName);
      setChildrenByPath((prev) => ({ ...prev, [result.tree.path]: result.tree.children ?? [] }));

      const otherExpanded = [...expandedPaths].filter((path) => path !== result.tree.path);
      if (otherExpanded.length > 0) {
        const entries = await Promise.all(
          otherExpanded.map(async (path) => [path, await api.listDir(path)] as const)
        );
        setChildrenByPath((prev) => {
          const next = { ...prev };
          for (const [path, children] of entries) next[path] = children;
          return next;
        });
      }
      setStatus(`Workspace: ${result.workspaceName}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await whenReady();
        await loadWorkspace();
        const starter = await api.newFileContent(null);
        pushNewTab(starter.content, starter.directoryName, false);
        setStatus("Ready");
      } catch (err) {
        setStatus(err instanceof Error ? err.message : String(err));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggle(node: TreeNode) {
    setSelected(node);
    const wasExpanded = expandedPaths.has(node.path);
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (wasExpanded) next.delete(node.path);
      else next.add(node.path);
      return next;
    });

    if (!wasExpanded && !childrenByPath[node.path]) {
      setLoadingPaths((prev) => new Set(prev).add(node.path));
      try {
        const children = await api.listDir(node.path);
        setChildrenByPath((prev) => ({ ...prev, [node.path]: children }));
      } finally {
        setLoadingPaths((prev) => {
          const next = new Set(prev);
          next.delete(node.path);
          return next;
        });
      }
    }
  }

  function resolveTargetDirectoryPath(): string {
    if (!selected) return root?.path ?? "";
    return selected.isDir ? selected.path : parentPathOf(selected.path);
  }

  async function ensureExpanded(path: string) {
    setExpandedPaths((prev) => {
      if (prev.has(path)) return prev;
      const next = new Set(prev);
      next.add(path);
      return next;
    });
    if (!childrenByPath[path]) {
      const children = await api.listDir(path);
      setChildrenByPath((prev) => ({ ...prev, [path]: children }));
    }
  }

  // ---- tabs ---------------------------------------------------------------

  function pushNewTab(content: string, directoryHint: string, announce = true) {
    untitledCounter.current += 1;
    const id = `untitled:${untitledCounter.current}`;
    const name = `Untitled-${untitledCounter.current}.rhubarb`;
    const tab: EditorTab = { id, path: null, name, content, savedContent: content };
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(id);
    if (announce) setStatus(`New Rhubarb file in ${directoryHint}`);
  }

  function updateActiveTabContent(value: string) {
    if (!activeTabId) return;
    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, content: value } : t)));
  }

  async function handleOpenFile(node: TreeNode) {
    setSelected(node);
    const existing = tabs.find((t) => t.path === node.path);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const result = await api.openFile(node.path);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    const tab: EditorTab = {
      id: result.path,
      path: result.path,
      name: result.name,
      content: result.content,
      savedContent: result.content,
    };
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
    setStatus(`Opened ${result.displayPath}`);
  }

  async function handleOpenFileDialog() {
    const result = await api.openFileDialog();
    if ("cancelled" in result) return;
    if (result.error) {
      window.alert(result.error);
      return;
    }
    const existing = tabs.find((t) => t.path === result.path);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const tab: EditorTab = {
      id: result.path,
      path: result.path,
      name: result.name,
      content: result.content,
      savedContent: result.content,
    };
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
    setStatus(`Opened ${result.displayPath}`);
  }

  async function handleNew() {
    const result = await api.newFileContent(selected?.path ?? null);
    pushNewTab(result.content, result.directoryName);
  }

  async function handleOpenMatch(path: string, match: SearchMatch) {
    const existing = tabs.find((t) => t.path === path);
    let tabId = existing?.id ?? null;
    if (!existing) {
      const result = await api.openFile(path);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      const tab: EditorTab = {
        id: result.path,
        path: result.path,
        name: result.name,
        content: result.content,
        savedContent: result.content,
      };
      setTabs((prev) => [...prev, tab]);
      tabId = tab.id;
    }
    setActiveTabId(tabId);
    scrollNonce.current += 1;
    setScrollTarget({ line: match.line, column: match.column, length: match.length, nonce: scrollNonce.current });
  }

  async function saveTab(tabId: string): Promise<string | null> {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return null;
    const result = await api.saveFile(tab.path, tab.content);
    if (result.cancelled) return null;
    if (result.error) {
      window.alert(result.error);
      return null;
    }
    const newId = result.path!;
    const newName = result.name!;
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, id: newId, path: newId, name: newName, savedContent: t.content } : t))
    );
    setActiveTabId((prev) => (prev === tabId ? newId : prev));
    setStatus(`Saved ${newName}`);
    refreshTree();
    return newId;
  }

  async function handleSaveActiveTab() {
    if (!activeTabId) return;
    await saveTab(activeTabId);
  }

  function removeTab(id: string) {
    setTabs((prevTabs) => {
      const idx = prevTabs.findIndex((t) => t.id === id);
      if (idx === -1) return prevTabs;
      const next = prevTabs.filter((t) => t.id !== id);
      setActiveTabId((prevActive) => {
        if (prevActive !== id) return prevActive;
        if (next.length === 0) return null;
        const neighborIdx = idx > 0 ? idx - 1 : 0;
        return next[neighborIdx]?.id ?? null;
      });
      return next;
    });
  }

  function handleCloseTab(id: string) {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    if (tab.content === tab.savedContent) {
      removeTab(id);
    } else {
      setPendingCloseTabId(id);
    }
  }

  function cycleTab(direction: 1 | -1) {
    if (tabs.length === 0) return;
    const idx = tabs.findIndex((t) => t.id === activeTabId);
    const nextIdx = idx === -1 ? 0 : (idx + direction + tabs.length) % tabs.length;
    setActiveTabId(tabs[nextIdx].id);
  }

  async function handleConfirmSave() {
    if (!pendingCloseTabId) return;
    const newId = await saveTab(pendingCloseTabId);
    if (newId) removeTab(newId);
    setPendingCloseTabId(null);
  }

  function handleConfirmDontSave() {
    if (!pendingCloseTabId) return;
    removeTab(pendingCloseTabId);
    setPendingCloseTabId(null);
  }

  function handleConfirmCancel() {
    setPendingCloseTabId(null);
  }

  // ---- run / translate ---------------------------------------------------

  async function handleRun() {
    if (!activeTab) {
      setStatus("No file open");
      return;
    }
    const result = await api.runFile(activeTab.path, activeTab.content);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    if (result.path && result.name) {
      const tabId = activeTab.id;
      const newId = result.path;
      const newName = result.name;
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, id: newId, path: newId, name: newName, savedContent: t.content } : t
        )
      );
      setActiveTabId((prev) => (prev === tabId ? newId : prev));
    }
    setOutput(result.output);
    setOutputIsError(result.isError);
    setStatus(`Finished ${result.name ?? activeTab.name} with exit code ${result.exitCode}`);
    refreshTree();
  }

  async function handleShowPython() {
    if (!activeTab) {
      setStatus("No file open");
      return;
    }
    const result = await api.showPython(activeTab.content);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    setPythonPreview(result.python ?? "");
  }

  // ---- workspace mutation -------------------------------------------------

  async function handleOpenFolder() {
    const result = await api.chooseWorkspace();
    if ("cancelled" in result) return;
    applyWorkspace(result);
  }

  async function handleAddFolder() {
    setSearchOpen(false);
    const parentPath = resolveTargetDirectoryPath();
    await ensureExpanded(parentPath);
    setPendingCreate({ parentPath, kind: "folder" });
  }

  async function handleAddFile() {
    setSearchOpen(false);
    const parentPath = resolveTargetDirectoryPath();
    await ensureExpanded(parentPath);
    setPendingCreate({ parentPath, kind: "file" });
  }

  async function handleCommitCreate(name: string) {
    if (!pendingCreate) return;
    const { parentPath, kind } = pendingCreate;

    if (kind === "folder") {
      const result = await api.createFolder(parentPath, name);
      if (result.error) {
        window.alert(result.error);
        return;
      }
      setPendingCreate(null);
      refreshTree();
      return;
    }

    const result = await api.createFile(parentPath, name);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    setPendingCreate(null);
    const tab: EditorTab = {
      id: result.path,
      path: result.path,
      name: result.name,
      content: result.content,
      savedContent: result.content,
    };
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
    refreshTree();
  }

  function handleCancelCreate() {
    setPendingCreate(null);
  }

  function closeTabsUnder(targetPath: string) {
    setTabs((prevTabs) => {
      const toRemove = new Set(
        prevTabs.filter((t) => t.path && isPathInside(t.path, targetPath)).map((t) => t.id)
      );
      if (toRemove.size === 0) return prevTabs;
      const next = prevTabs.filter((t) => !toRemove.has(t.id));
      setActiveTabId((prevActive) => {
        if (!prevActive || !toRemove.has(prevActive)) return prevActive;
        if (next.length === 0) return null;
        const firstRemovedIdx = prevTabs.findIndex((t) => toRemove.has(t.id));
        const neighborIdx = firstRemovedIdx > 0 ? firstRemovedIdx - 1 : 0;
        return next[Math.min(neighborIdx, next.length - 1)]?.id ?? null;
      });
      return next;
    });
  }

  function handleRequestDelete(node: TreeNode) {
    setPendingDeleteNode(node);
  }

  async function handleConfirmDelete() {
    const node = pendingDeleteNode;
    if (!node) return;
    setPendingDeleteNode(null);

    const result = await api.deleteFile(node.path);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    closeTabsUnder(node.path);
    if (selected && isPathInside(selected.path, node.path)) setSelected(null);
    setStatus(`Deleted ${node.name}`);
    refreshTree();
  }

  function handleCancelDelete() {
    setPendingDeleteNode(null);
  }

  async function handleRenameNode(node: TreeNode) {
    const newName = window.prompt("New name:", node.name);
    if (!newName || newName === node.name) return;

    const result = await api.renamePath(node.path, newName);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    const newPath = result.path!;
    const newDisplayName = result.name!;
    setTabs((prevTabs) => {
      const matchIdx = prevTabs.findIndex((t) => t.path === node.path);
      if (matchIdx === -1) return prevTabs;
      const oldId = prevTabs[matchIdx].id;
      setActiveTabId((prevActive) => (prevActive === oldId ? newPath : prevActive));
      return prevTabs.map((t, i) => (i === matchIdx ? { ...t, id: newPath, path: newPath, name: newDisplayName } : t));
    });
    if (selected?.path === node.path) {
      setSelected({ ...node, path: newPath, name: newDisplayName });
    }
    setStatus(`Renamed to ${newDisplayName}`);
    refreshTree();
  }

  function handleDragStartNode(node: TreeNode) {
    setDraggingPath(node.path);
  }

  function handleDragEndNode() {
    setDraggingPath(null);
  }

  async function handleDropNode(target: TreeNode) {
    const sourcePath = draggingPath;
    setDraggingPath(null);
    if (!sourcePath) return;
    const targetDir = resolveDropTarget(sourcePath, target);
    if (!targetDir) return;

    const result = await api.movePath(sourcePath, targetDir);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    const newPath = result.path!;

    function remap(path: string): string | null {
      if (path === sourcePath) return newPath;
      if (isPathInside(path, sourcePath)) return newPath + path.slice(sourcePath.length);
      return null;
    }

    setTabs((prevTabs) => {
      const idRemap = new Map<string, string>();
      const next = prevTabs.map((t) => {
        if (!t.path) return t;
        const updatedPath = remap(t.path);
        if (updatedPath === null) return t;
        idRemap.set(t.id, updatedPath);
        return { ...t, id: updatedPath, path: updatedPath };
      });
      if (idRemap.size > 0) {
        setActiveTabId((prevActive) => (prevActive && idRemap.has(prevActive) ? idRemap.get(prevActive)! : prevActive));
      }
      return next;
    });

    setExpandedPaths((prev) => {
      let changed = false;
      const next = new Set<string>();
      for (const path of prev) {
        const updatedPath = remap(path);
        if (updatedPath !== null) changed = true;
        next.add(updatedPath ?? path);
      }
      return changed ? next : prev;
    });

    if (selected) {
      const updatedSelectedPath = remap(selected.path);
      if (updatedSelectedPath !== null) setSelected({ ...selected, path: updatedSelectedPath });
    }

    setStatus(`Moved ${result.name}`);
    refreshTree();
  }

  // ---- keyboard shortcuts -------------------------------------------------

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const ctrl = event.ctrlKey || event.metaKey;
      const modalOpen =
        pythonPreview !== null ||
        pendingCloseTabId !== null ||
        contextMenu !== null ||
        pendingDeleteNode !== null ||
        pendingCreate !== null;

      if (event.key === "Escape") {
        if (pythonPreview !== null) setPythonPreview(null);
        else if (pendingCloseTabId !== null) setPendingCloseTabId(null);
        else if (contextMenu !== null) setContextMenu(null);
        else if (pendingDeleteNode !== null) setPendingDeleteNode(null);
        else if (pendingCreate !== null) setPendingCreate(null);
        return;
      }

      if (modalOpen) return;

      if (ctrl && event.shiftKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        api.newWindow().then((result) => {
          if (result.error) window.alert(result.error);
        });
        return;
      }
      if (ctrl && event.shiftKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        handleOpenFolder();
        return;
      }
      if (ctrl && event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }
      if (ctrl && event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        handleShowPython();
        return;
      }
      if (ctrl && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSaveActiveTab();
        return;
      }
      if (ctrl && event.key.toLowerCase() === "n") {
        event.preventDefault();
        handleNew();
        return;
      }
      if (ctrl && event.key.toLowerCase() === "o") {
        event.preventDefault();
        handleOpenFileDialog();
        return;
      }
      if (ctrl && event.key.toLowerCase() === "w") {
        event.preventDefault();
        if (activeTabId) handleCloseTab(activeTabId);
        return;
      }
      if (ctrl && event.key === "Tab") {
        event.preventDefault();
        cycleTab(event.shiftKey ? -1 : 1);
        return;
      }
      if (ctrl && /^[1-9]$/.test(event.key)) {
        event.preventDefault();
        const idx = event.key === "9" ? tabs.length - 1 : Number(event.key) - 1;
        if (tabs[idx]) setActiveTabId(tabs[idx].id);
        return;
      }
      if ((ctrl && event.key === "Enter") || event.key === "F5") {
        event.preventDefault();
        handleRun();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tabs,
    activeTabId,
    selected,
    pythonPreview,
    pendingCloseTabId,
    contextMenu,
    pendingDeleteNode,
    pendingCreate,
  ]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div ref={sidebarRef} className="contents">
        <Sidebar
          workspaceLabel={workspaceLabel}
          root={root}
          expandedPaths={expandedPaths}
          childrenByPath={childrenByPath}
          selectedPath={selected?.path ?? null}
          loadingPaths={loadingPaths}
          onToggle={handleToggle}
          onSelectFile={handleOpenFile}
          onContextMenu={(node, x, y) => setContextMenu({ node, x, y })}
          onAddFolder={handleAddFolder}
          onAddFile={handleAddFile}
          onOpenFolder={handleOpenFolder}
          onOpenFile={handleOpenFileDialog}
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((prev) => !prev)}
          onOpenMatch={handleOpenMatch}
          pendingCreate={pendingCreate}
          onCommitCreate={handleCommitCreate}
          onCancelCreate={handleCancelCreate}
          draggingPath={draggingPath}
          onDragStartNode={handleDragStartNode}
          onDragEndNode={handleDragEndNode}
          onDropNode={handleDropNode}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
          onCloseTab={handleCloseTab}
          onRun={handleRun}
          onShowPython={handleShowPython}
        />
        {activeTab ? (
          <Editor
            value={activeTab.content}
            onChange={updateActiveTabContent}
            fileName={activeTab.name}
            scrollTo={scrollTarget}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-custard-100/40">
            No file open — press Ctrl+N or Ctrl+O
          </div>
        )}
        <Output output={output} isError={outputIsError} />
        <StatusBar message={status} />
      </div>

      {pythonPreview !== null && (
        <PythonPreviewModal python={pythonPreview} onClose={() => setPythonPreview(null)} />
      )}

      {pendingCloseTabId !== null && (
        <ConfirmCloseModal
          fileName={tabs.find((t) => t.id === pendingCloseTabId)?.name ?? "this file"}
          onSave={handleConfirmSave}
          onDontSave={handleConfirmDontSave}
          onCancel={handleConfirmCancel}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            { label: "Rename", action: () => handleRenameNode(contextMenu.node) },
            { label: "Delete", action: () => handleRequestDelete(contextMenu.node) },
            { label: "Refresh", action: () => refreshTree() },
          ]}
        />
      )}

      {pendingDeleteNode && (
        <ConfirmModal
          title={`Delete ${pendingDeleteNode.name}?`}
          message={
            pendingDeleteNode.isDir
              ? "This folder and everything inside it will be permanently deleted."
              : "This file will be permanently deleted."
          }
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
