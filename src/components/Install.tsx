import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

type OsKey = "windows" | "mac" | "linux";

const OS_LABELS: Record<OsKey, string> = {
  windows: "Windows",
  mac: "macOS",
  linux: "Linux",
};

const STEPS: Record<OsKey, { n: string; title: string; line: string }[]> = {
  windows: [
    { n: "01", title: "Clone", line: "$ git clone https://github.com/BlueBrik1/rhubarb.git" },
    { n: "02", title: "Install", line: "$ cd rhubarb-ide-webui; npm i; npm run build" },
    { n: "03", title: "Run", line: "$ cd ..\\IDE^2\\IDE^2; python rhubarb_ide.py" },
  ],
  mac: [
    { n: "01", title: "Clone", line: "$ git clone https://github.com/BlueBrik1/rhubarb.git" },
    { n: "02", title: "Install", line: "$ cd rhubarb-ide-webui && npm i && npm run build" },
    { n: "03", title: "Run", line: "$ cd ../IDE^2/IDE^2 && python3 rhubarb_ide.py" },
  ],
  linux: [
    { n: "01", title: "Clone", line: "$ git clone https://github.com/BlueBrik1/rhubarb.git" },
    { n: "02", title: "Install", line: "$ cd rhubarb-ide-webui && npm i && npm run build" },
    { n: "03", title: "Run", line: "$ cd ../IDE^2/IDE^2 && python3 rhubarb_ide.py" },
  ],
};

export default function Install() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [os, setOs] = useState<OsKey>("windows");
  const steps = STEPS[os];

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
            Clone the repo, install the frontend, and launch the IDE. Pick
            your OS for the exact commands.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {(Object.keys(OS_LABELS) as OsKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setOs(key)}
                aria-pressed={os === key}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  os === key
                    ? "bg-rhubarb-600 text-custard-50"
                    : "border-2 border-rhubarb-900/15 text-rhubarb-900/70 hover:border-rhubarb-900/30"
                }`}
              >
                {OS_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-4">
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
