import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const features = [
  {
    n: "01",
    title: "Real Python underneath",
    body: "Every .rhubarb file compiles back to real Python before anything runs, whether it's public or encrypted. Nothing about execution changes either way.",
  },
  {
    n: "02",
    title: "Public by default",
    body: "Write and save a file with no key at all, and anyone with the IDE can open and run it. Nothing is hidden unless you choose to hide it.",
  },
  {
    n: "03",
    title: "Encrypt it with a key",
    body: "Generate a key in the IDE, and one terminal command encrypts every Python file in a folder into a private version only that key can read.",
  },
  {
    n: "04",
    title: "Looks completely encrypted",
    body: "An encrypted file gives away nothing by looking at it — there's no way to guess what it does. The IDE marks it with a lock badge so you always know which is which.",
  },
  {
    n: "05",
    title: "Decrypt it with the same key",
    body: "Open or run an encrypted file with the matching key loaded and it decodes straight back to Python. A different key simply won't work.",
  },
  {
    n: "06",
    title: "One IDE, one download",
    body: "Tabs, a file tree, workspace search, and a real interactive terminal — everything you need to write, encrypt, decrypt, and run is in one app.",
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
