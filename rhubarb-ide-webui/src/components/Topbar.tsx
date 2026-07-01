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
  activeTabIsPrivateDialect: boolean;
}

export default function Topbar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onRun,
  onShowPython,
  activeTabIsPrivateDialect,
}: TopbarProps) {
  return (
    <div className="flex h-9 flex-shrink-0 items-center bg-rhubarb-900">
      <TabStrip tabs={tabs} activeTabId={activeTabId} onSelectTab={onSelectTab} onCloseTab={onCloseTab} />
      <div className="ml-auto flex flex-shrink-0 items-center gap-2 px-3">
        {activeTabIsPrivateDialect && (
          <span
            title="This file is in the private key-encoded dialect, not the public one — running or previewing it decodes with whatever key is currently saved."
            className="font-display flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-300"
          >
            🔒 PRIVATE DIALECT
          </span>
        )}
        <IconButton variant="primary" onClick={onRun} title="Run (Ctrl+Enter)">
          <PlayIcon />
        </IconButton>
        <Button onClick={onShowPython}>Show Python</Button>
      </div>
    </div>
  );
}
