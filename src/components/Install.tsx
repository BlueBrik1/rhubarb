import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const steps = [
  {
    n: "01",
    title: "Clone",
    line: "$ git clone https://github.com/BlueBrik1/rhubarb.git",
  },
  {
    n: "02",
    title: "Install",
    line: "$ cd rhubarb-ide-webui; npm i; npm run build",
  },
  {
    n: "03",
    title: "Run",
    line: "$ cd ..\\ide^2\\ide^2; python3 rhubarb_ide.py",
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
            Three steps to get running.
          </h2>
          <p className="mt-4 text-lg text-rhubarb-900/70">
            The IDE is the only tool you need. Launch it, write a{" "}
            <code className="font-mono">.rhubarb</code> file, and run it —
            from the toolbar, or from the terminal's own{" "}
            <code className="font-mono">rhubarb.py</code> command.
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
