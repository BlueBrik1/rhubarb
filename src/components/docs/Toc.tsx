interface TocItem {
  id: string;
  label: string;
}

export default function Toc({ items }: { items: TocItem[] }) {
  return (
    <nav className="hidden lg:block">
      <p className="font-display mb-3 text-xs font-semibold uppercase tracking-wider text-rhubarb-900/40">
        On this page
      </p>
      <ul className="max-h-[calc(100vh-12rem)] space-y-1 overflow-y-auto pr-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="block rounded-lg px-3 py-1.5 text-rhubarb-900/60 transition-colors hover:bg-custard-100 hover:text-rhubarb-700"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
