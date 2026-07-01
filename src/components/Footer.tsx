import { Link } from "react-router-dom";

const columns = [
  {
    title: "Language",
    links: [
      { label: "Syntax", href: "/#syntax" },
      { label: "Docs", href: "/docs" },
      
    ],
  },
  {
    title: "The IDE",
    links: [
      { label: "Download", href: "/#install" },
      { label: "Examples", href: "/docs#complete-example" },
      
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "#" },
      
      
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-rhubarb-900/10 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Link to="/" className="flex items-baseline gap-1.5 font-display">
              <span className="text-xl font-bold tracking-tight text-rhubarb-900">
                rhubarb
              </span>
              <span className="text-xl font-bold text-leaf-600">.</span>
            </Link>
            <p className="mt-3 text-sm text-rhubarb-900/60">
              A language and its own IDE in one project. Full technical
              details live in the docs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-sm font-semibold text-rhubarb-950">
                  {col.title}
                </h4>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-rhubarb-900/60 transition-colors hover:text-rhubarb-600"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-rhubarb-900/10 pt-6 text-sm text-rhubarb-900/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Rhubarb. MIT licensed.</p>
          <p>Every .rhubarb file is real Python underneath.</p>
        </div>
      </div>
    </footer>
  );
}
