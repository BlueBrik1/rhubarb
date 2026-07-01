import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export default function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="docs-section scroll-mt-28 border-t border-rhubarb-900/10 py-12 first:border-t-0 first:pt-0">
      <h2 className="font-display text-2xl font-bold tracking-tight text-rhubarb-950 sm:text-3xl">
        {title}
      </h2>
      <div className="prose-docs mt-5 space-y-5 text-rhubarb-900/80">{children}</div>
    </section>
  );
}
