import FileIcon from "./FileIcon";
import { CloseIcon } from "./icons/ToolbarIcons";
import type { EditorTab } from "../types";

interface TabProps {
  tab: EditorTab;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export default function Tab({ tab, isActive, onSelect, onClose }: TabProps) {
  const isDirty = tab.content !== tab.savedContent;

  return (
    <div
      onClick={onSelect}
      title={tab.path ?? tab.name}
      className={`group flex h-9 flex-shrink-0 cursor-pointer items-center gap-1.5 border-r border-rhubarb-950/40 px-3 text-[13px] transition-colors ${
        isActive ? "bg-rhubarb-950 text-custard-50" : "text-custard-100/70 hover:bg-rhubarb-800/50"
      }`}
    >
      <FileIcon name={tab.name} />
      <span className="font-mono max-w-[12rem] truncate">{tab.name}</span>
      <span className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center">
        {isDirty && (
          <span className="h-1.5 w-1.5 rounded-full bg-custard-200 group-hover:hidden" />
        )}
        <button
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          title="Close"
          className={`absolute inset-0 flex items-center justify-center rounded text-custard-100/40 hover:bg-rhubarb-700 hover:text-custard-50 ${
            isDirty ? "hidden group-hover:flex" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <CloseIcon />
        </button>
      </span>
    </div>
  );
}
