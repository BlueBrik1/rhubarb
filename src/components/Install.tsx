import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const steps = [
  {
    n: "01",
    title: "Get the IDE",
    line: "$ python3 rhubarb_ide.py",
  },
  {
    n: "02",
    title: "Write something",
    line: "$ open garden.rhubarb",
  },
  {
    n: "03",
    title: "Run it",
    line: "$ python3 rhubarb.py garden.rhubarb",
  },
];

export default function Install() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".install-step", {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
      });
      gsap.from(".install-heading", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
    },
    { scope: rootRef }
  );

  return (
    <section id="install" ref={rootRef} className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="install-heading mx-auto max-w-xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-rhubarb-950 sm:text-5xl">
            Three incredibly easy steps.
          </h2>
          <p className="mt-4 text-lg text-rhubarb-900/70">
            The IDE is the only thing you need. Open it, write a few
            squiggles, and it compiles straight to Python. Couldn't be
            simpler. It could not, in fact, be simpler.
          </p>
        </div>

        <div className="mt-14 space-y-4">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className="install-step flex flex-col gap-4 rounded-2xl border border-rhubarb-900/10 bg-custard-100/60 p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4 sm:w-56 sm:flex-shrink-0">
                <span className="font-display text-2xl font-bold text-rhubarb-300">
                  {step.n}
                </span>
                <h3 className="font-display font-semibold text-rhubarb-950">
                  {step.title}
                </h3>
              </div>
              <div className="flex-1 rounded-xl bg-rhubarb-950 px-4 py-3 font-mono text-sm text-custard-100">
                <span className="text-leaf-300">{step.line.slice(0, 1)}</span>
                {step.line.slice(1)}
                {i === steps.length - 1 && (
                  <span className="animate-blink ml-1 inline-block h-4 w-2 translate-y-0.5 bg-custard-100 align-middle" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
