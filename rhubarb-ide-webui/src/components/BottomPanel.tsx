import type { TerminalEntry } from "../types";
import Output from "./Output";
import Terminal from "./Terminal";

interface BottomPanelProps {
  tab: "output" | "terminal";
  onSelectTab: (tab: "output" | "terminal") => void;
  output: string;
  outputIsError: boolean;
  terminalCwd: string;
  terminalEntries: TerminalEntry[];
  terminalBusy: boolean;
  onTerminalRun: (command: string) => void;
}

export default function BottomPanel({
  tab,
  onSelectTab,
  output,
  outputIsError,
  terminalCwd,
  terminalEntries,
  terminalBusy,
  onTerminalRun,
}: BottomPanelProps) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-3 border-t border-rhubarb-800/60 bg-rhubarb-900 px-3 pt-2.5">
        <button
          onClick={() => onSelectTab("output")}
          className={`font-display text-[11px] font-bold tracking-wider ${
            tab === "output" ? "text-custard-100" : "text-custard-100/40 hover:text-custard-100/70"
          }`}
        >
          OUTPUT
        </button>
        <button
          onClick={() => onSelectTab("terminal")}
          className={`font-display text-[11px] font-bold tracking-wider ${
            tab === "terminal" ? "text-custard-100" : "text-custard-100/40 hover:text-custard-100/70"
          }`}
        >
          TERMINAL
        </button>
      </div>
      {tab === "output" ? (
        <Output output={output} isError={outputIsError} />
      ) : (
        <Terminal cwd={terminalCwd} entries={terminalEntries} busy={terminalBusy} onRun={onTerminalRun} />
      )}
    </div>
  );
}
