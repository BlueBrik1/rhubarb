import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const features = [
  {
    n: "01",
    title: "Real Python underneath",
    body: "Every .rhubarb file is Python with the keywords swapped out. The compiler translates it back before anything runs — nothing about execution semantics changes.",
  },
  {
    n: "02",
    title: "Its own mandatory space",
    body: "Indentation and every gap between tokens use a dedicated Unicode character, ꧃, instead of a normal space or tab. An ordinary space outside a string or comment fails to compile.",
  },
  {
    n: "03",
    title: "One IDE, one download",
    body: "Tabs, a file tree, workspace search and replace, and syntax highlighting for every language it opens — except .rhubarb files, which are deliberately never highlighted.",
  },
  {
    n: "04",
    title: "A real terminal, one extra command",
    body: "The bottom panel has an interactive terminal scoped to a tracked directory. The only thing it does beyond running shell commands is /mirror.",
  },
  {
    n: "05",
    title: "An optional private dialect",
    body: "Generate a key, and /mirror re-encodes any directory's Python into a second, key-derived vocabulary that only the same key can decode back.",
  },
  {
    n: "06",
    title: "Backwards, if you want",
    body: "Reverse-line modes let a file be written (or read) with every line reversed, partially or completely, and translated back automatically.",
  },
];

export default function Features() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");
      gsap.from(cards, {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 75%",
        },
      });
    },
    { scope: rootRef }
  );

  return (
    <section id="features" ref={rootRef} className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-rhubarb-950 sm:text-5xl">
            What it actually does.
          </h2>
          <p className="mt-4 text-lg text-rhubarb-900/70">
            Rhubarb is a language and an IDE in one project. Here's what's
            really going on under the hood.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.n}
              className="feature-card group relative overflow-hidden rounded-3xl border border-rhubarb-900/10 bg-custard-100/60 p-7 transition-colors duration-300 hover:border-rhubarb-300 hover:bg-custard-100"
            >
              <span className="font-display absolute -right-2 -top-4 text-7xl font-bold text-rhubarb-900/[0.06] transition-colors duration-300 group-hover:text-rhubarb-300/40">
                {f.n}
              </span>
              <h3 className="font-display relative text-xl font-semibold text-rhubarb-950">
                {f.title}
              </h3>
              <p className="relative mt-3 text-rhubarb-900/70">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
