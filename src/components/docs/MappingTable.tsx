interface MappingTableProps {
  columns: string[];
  rows: string[][];
  mono?: boolean;
}

export default function MappingTable({ columns, rows, mono = true }: MappingTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-rhubarb-900/10">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-custard-200/50">
            {columns.map((col) => (
              <th
                key={col}
                className="font-display border-b border-rhubarb-900/10 px-4 py-3 font-semibold text-rhubarb-950"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-custard-100/40" : "bg-custard-50"}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`border-b border-rhubarb-900/5 px-4 py-2.5 text-rhubarb-900/80 ${
                    mono ? "font-mono text-[13px]" : "text-sm leading-relaxed"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
