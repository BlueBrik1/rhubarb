import Tab from "./Tab";
import type { EditorTab } from "../types";

interface TabStripProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

export default function TabStrip({ tabs, activeTabId, onSelectTab, onCloseTab }: TabStripProps) {
  if (tabs.length === 0) {
    return (
      <div className="flex h-9 flex-1 items-center px-3 text-[13px] text-custard-100/40">
        No file open
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 overflow-x-auto">
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onSelect={() => onSelectTab(tab.id)}
          onClose={() => onCloseTab(tab.id)}
        />
      ))}
    </div>
  );
}
