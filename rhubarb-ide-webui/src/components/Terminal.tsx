import { useEffect, useRef, useState } from "react";
import type { TerminalEntry } from "../types";

interface TerminalProps {
  cwd: string;
  entries: TerminalEntry[];
  busy: boolean;
  onRun: (command: string) => void;
}

export default function Terminal({ cwd, entries, busy, onRun }: TerminalProps) {
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  function submit() {
    const command = input.trim();
    if (!command || busy) return;
    onRun(command);
    setInput("");
    setHistoryIndex(null);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      submit();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (entries.length === 0) return;
      const nextIndex = historyIndex === null ? entries.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(entries[nextIndex].command);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= entries.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(entries[nextIndex].command);
      }
    }
  }

  return (
    <div
      className="flex h-44 flex-shrink-0 flex-col bg-rhubarb-900"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="font-mono mx-3 mt-2 mb-1.5 flex-1 overflow-auto rounded-lg bg-rhubarb-950 p-3 text-[13px]">
        {entries.map((entry, index) => (
          <div key={index} className="mb-1.5">
            <p className="text-custard-100/50">
              <span className="text-leaf-400">{entry.cwd}</span>
              <span className="text-custard-100/40">{">"}</span> {entry.command}
            </p>
            {entry.output && (
              <pre className={`whitespace-pre-wrap ${entry.isError ? "text-rhubarb-300" : "text-custard-100/90"}`}>
                {entry.output}
              </pre>
            )}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="text-leaf-400">{cwd}</span>
          <span className="text-custard-100/40">{">"}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy}
            autoFocus
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-custard-100 outline-none placeholder:text-custard-100/30"
            placeholder={busy ? "running…" : "type a command, or /mirror"}
          />
        </div>
      </div>
    </div>
  );
}
