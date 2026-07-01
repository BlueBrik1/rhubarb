import { useEffect, useRef, useState } from "react";
import FileIcon from "./FileIcon";
import { FolderIcon } from "./icons/ToolbarIcons";

interface TreeCreateRowProps {
  depth: number;
  kind: "file" | "folder";
  onCommit: (name: string) => void;
  onCancel: () => void;
}

function hasSlash(name: string): boolean {
  return name.includes("/") || name.includes("\\");
}

function hasFileExtension(name: string): boolean {
  return /\.[^./\\]+$/.test(name);
}

export default function TreeCreateRow({ depth, kind, onCommit, onCancel }: TreeCreateRowProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function tryCommit() {
    const trimmed = name.trim();
    if (!trimmed) {
      onCancel();
      return;
    }
    if (hasSlash(trimmed)) {
      setError("Names cannot contain slashes.");
      return;
    }
    if (kind === "file" && !hasFileExtension(trimmed)) {
      setError("Give the file a name and extension, e.g. notes.rhubarb");
      return;
    }
    committedRef.current = true;
    onCommit(trimmed);
  }

  return (
    <div>
      <div
        className="flex items-center gap-1.5 rounded-md py-1 pr-2 text-sm"
        style={{ paddingLeft: 10 + depth * 16 }}
      >
        <span className="inline-block w-3 flex-shrink-0" />
        {kind === "folder" ? <FolderIcon /> : <FileIcon name={name} />}
        <input
          ref={inputRef}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Enter") {
              event.preventDefault();
              tryCommit();
            } else if (event.key === "Escape") {
              event.preventDefault();
              committedRef.current = true;
              onCancel();
            }
          }}
          onBlur={() => {
            if (!committedRef.current) onCancel();
          }}
          className={`min-w-0 flex-1 rounded border bg-rhubarb-950 px-1.5 py-0.5 font-mono text-[13px] text-custard-100 focus:outline-none ${
            error ? "border-rhubarb-400" : "border-rhubarb-500"
          }`}
        />
      </div>
      {error && (
        <p className="px-2 pb-1 text-[11px] text-rhubarb-300" style={{ paddingLeft: 22 + depth * 16 }}>
          {error}
        </p>
      )}
    </div>
  );
}
