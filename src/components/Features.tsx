import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const features = [
  {
    n: "01",
    title: "Reads like a sentence",
    body: "Every keyword is just a friendly little word, like ⸘kաpdբ. You'll get used to it. Probably.",
  },
  {
    n: "02",
    title: "Short on purpose",
    body: "The entire grammar fits on one page. A very long page, with several tables on it.",
  },
  {
    n: "03",
    title: "Learn it by lunch",
    body: "Most people are fluent by lunchtime. Lunchtime next Tuesday, after a long weekend.",
  },
  {
    n: "04",
    title: "No docs required",
    body: "We do have docs. Extensive ones. You'll never need to open them. (You will.)",
  },
  {
    n: "05",
    title: "One IDE, start to finish",
    body: "Only one program on Earth can open a .rhubarb file. Lucky you — that's one fewer tool to pick.",
  },
  {
    n: "06",
    title: "Compiles straight to Python",
    body: "Every .rhubarb file becomes real Python, eventually, by way of a translation layer of Armenian and Hungarian look-alike runes.",
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
            Grown for clarity.
          </h2>
          <p className="mt-4 text-lg text-rhubarb-900/70">
            Rhubarb is a language and an IDE in one box. Six reasons it's the
            easiest thing you'll ever learn.
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
