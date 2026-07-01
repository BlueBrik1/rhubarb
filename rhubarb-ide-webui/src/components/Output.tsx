interface OutputProps {
  output: string;
  isError: boolean;
}

export default function Output({ output, isError }: OutputProps) {
  return (
    <div className="flex h-44 flex-shrink-0 flex-col bg-rhubarb-900">
      <pre
        className={`font-mono mx-3 mt-2 mb-3 flex-1 overflow-auto whitespace-pre-wrap rounded-lg bg-rhubarb-950 p-3 text-[13px] ${
          isError ? "text-rhubarb-300" : "text-custard-100/90"
        }`}
      >
        {output}
      </pre>
    </div>
  );
}
