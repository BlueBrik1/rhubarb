import Button from "./Button";
import IconButton from "./IconButton";
import { PlayIcon } from "./icons/ToolbarIcons";
import TabStrip from "./TabStrip";
import type { EditorTab } from "../types";

interface TopbarProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onRun: () => void;
  onShowPython: () => void;
}

export default function Topbar({ tabs, activeTabId, onSelectTab, onCloseTab, onRun, onShowPython }: TopbarProps) {
  return (
    <div className="flex h-9 flex-shrink-0 items-center bg-rhubarb-900">
      <TabStrip tabs={tabs} activeTabId={activeTabId} onSelectTab={onSelectTab} onCloseTab={onCloseTab} />
      <div className="ml-auto flex flex-shrink-0 items-center gap-2 px-3">
        <IconButton variant="primary" onClick={onRun} title="Run (Ctrl+Enter)">
          <PlayIcon />
        </IconButton>
        <Button onClick={onShowPython}>Show Python</Button>
      </div>
    </div>
  );
}
