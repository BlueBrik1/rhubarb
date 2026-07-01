interface CodeBlockProps {
  label?: string;
  code: string;
}

export default function CodeBlock({ label, code }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-rhubarb-900/10 bg-rhubarb-950 shadow-lg shadow-rhubarb-900/10">
      {label && (
        <div className="flex items-center gap-2 border-b border-custard-50/10 bg-rhubarb-900/40 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-rhubarb-400/70" />
          <span className="h-2 w-2 rounded-full bg-custard-200/70" />
          <span className="h-2 w-2 rounded-full bg-leaf-400/70" />
          <span className="ml-2 font-mono text-xs text-custard-100/50">{label}</span>
        </div>
      )}
      <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed text-custard-100/90">
        {code}
      </pre>
    </div>
  );
}
