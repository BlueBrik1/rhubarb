interface OutputProps {
  output: string;
  isError: boolean;
}

export default function Output({ output, isError }: OutputProps) {
  return (
    <div className="flex h-44 flex-shrink-0 flex-col border-t border-rhubarb-800/60 bg-rhubarb-900">
      <p className="font-display px-3 pt-2.5 pb-1.5 text-[11px] font-bold tracking-wider text-custard-100/50">
        OUTPUT
      </p>
      <pre
        className={`font-mono mx-3 mb-3 flex-1 overflow-auto whitespace-pre-wrap rounded-lg bg-rhubarb-950 p-3 text-[13px] ${
          isError ? "text-rhubarb-300" : "text-custard-100/90"
        }`}
      >
        {output}
      </pre>
    </div>
  );
}
