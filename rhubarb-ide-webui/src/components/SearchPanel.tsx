import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import type { SearchFileResult, SearchMatch } from "../types";
import Button from "./Button";
import FileIcon from "./FileIcon";
import { ChevronIcon } from "./icons/ToolbarIcons";

interface SearchPanelProps {
  onOpenMatch: (path: string, match: SearchMatch) => void;
}

export default function SearchPanel({ onOpenMatch }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [results, setResults] = useState<SearchFileResult[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");
  const requestId = useRef(0);

  async function runSearch(currentQuery: string, currentMatchCase: boolean) {
    if (!currentQuery) {
      setResults([]);
      setStatus("");
      return;
    }
    const id = ++requestId.current;
    const response = await api.searchWorkspace(currentQuery, currentMatchCase);
    if (id !== requestId.current) return; // a newer search has since started; drop this stale reply
    if (response.error) {
      setResults([]);
      setStatus(response.error);
      return;
    }
    const files = response.results ?? [];
    setResults(files);
    setExpanded(new Set(files.map((file) => file.path)));
    const totalMatches = files.reduce((sum, file) => sum + file.matches.length, 0);
    setStatus(
      files.length === 0
        ? "No results"
        : `${totalMatches} result${totalMatches === 1 ? "" : "s"} in ${files.length} file${files.length === 1 ? "" : "s"}`
    );
  }

  useEffect(() => {
    const timeout = setTimeout(() => runSearch(query, matchCase), 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, matchCase]);

  function toggleExpanded(path: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  async function handleReplaceInFile(file: SearchFileResult) {
    const result = await api.replaceInFile(file.path, query, replaceValue, matchCase);
    if (result.error) {
      setStatus(result.error);
      return;
    }
    runSearch(query, matchCase);
  }

  async function handleReplaceAll() {
    if (results.length === 0) return;
    setStatus("Replacing…");
    for (const file of results) {
      await api.replaceInFile(file.path, query, replaceValue, matchCase);
    }
    runSearch(query, matchCase);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-1.5 px-2 pb-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") runSearch(query, matchCase);
          }}
          placeholder="Search"
          autoFocus
          className="w-full rounded-md border border-rhubarb-800 bg-rhubarb-950 px-2.5 py-1.5 text-[13px] text-custard-100 placeholder:text-custard-100/30 focus:border-rhubarb-500 focus:outline-none"
        />
        <input
          value={replaceValue}
          onChange={(event) => setReplaceValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleReplaceAll();
          }}
          placeholder="Replace"
          className="w-full rounded-md border border-rhubarb-800 bg-rhubarb-950 px-2.5 py-1.5 text-[13px] text-custard-100 placeholder:text-custard-100/30 focus:border-rhubarb-500 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs text-custard-100/70">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(event) => setMatchCase(event.target.checked)}
              className="accent-rhubarb-500"
            />
            Match Case
          </label>
          <Button variant="sidebar" onClick={handleReplaceAll} disabled={results.length === 0}>
            Replace All
          </Button>
        </div>
        {status && <p className="text-[11px] text-custard-100/40">{status}</p>}
      </div>

      <div className="mx-2 mb-2 flex-1 overflow-y-auto rounded-xl bg-rhubarb-950 p-1.5">
        {results.map((file) => (
          <div key={file.path}>
            <div className="group flex items-center gap-1 rounded-md px-1 py-1 text-sm text-custard-100/85 hover:bg-rhubarb-800/60">
              <button
                onClick={() => toggleExpanded(file.path)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5"
              >
                <ChevronIcon expanded={expanded.has(file.path)} />
                <FileIcon name={file.name} />
                <span className="truncate font-mono text-[13px]">{file.name}</span>
              </button>
              <span className="relative flex h-4 w-12 flex-shrink-0 items-center justify-end">
                <span className="absolute inset-y-0 right-0 flex items-center text-[10px] text-custard-100/40 group-hover:hidden">
                  {file.matches.length}
                </span>
                <button
                  onClick={() => handleReplaceInFile(file)}
                  title="Replace all in this file"
                  className="absolute inset-y-0 right-0 hidden items-center rounded px-1.5 text-[10px] text-custard-100/40 hover:bg-rhubarb-700 hover:text-custard-50 group-hover:flex"
                >
                  Replace
                </button>
              </span>
            </div>
            {expanded.has(file.path) && (
              <div className="pl-6">
                {file.matches.map((match) => (
                  <div
                    key={`${file.path}:${match.line}:${match.column}`}
                    onClick={() => onOpenMatch(file.path, match)}
                    title={match.preview}
                    className="cursor-pointer truncate rounded-md px-2 py-0.5 font-mono text-[12px] text-custard-100/60 hover:bg-rhubarb-800/60 hover:text-custard-100"
                  >
                    <span className="mr-1.5 text-custard-100/30">{match.line}</span>
                    {match.preview}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
