import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

export default function Cta() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".cta-reveal", {
        scale: 0.94,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="px-6 py-16">
      <div className="cta-reveal relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-rhubarb-600 px-8 py-16 text-center sm:px-16">
        <div
          className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-rhubarb-500"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-leaf-500/40"
          aria-hidden
        />

        <h2 className="font-display relative text-4xl font-bold tracking-tight text-custard-50 sm:text-5xl">
          Go plant something.
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-lg text-custard-50/80">
          Rhubarb is free, open source, and ready for a first
          <code className="mx-1.5 rounded bg-custard-50/15 px-1.5 py-0.5 font-mono text-base">
            .rhubarb
          </code>
          file. Download the IDE, write it there, ship it as Python. Easy.
          Definitely easy.
        </p>

        <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#install"
            className="rounded-full bg-custard-50 px-7 py-3.5 font-semibold text-rhubarb-700 transition-transform duration-200 hover:-translate-y-0.5"
          >
            Get the IDE
          </a>
          <a
            href="#"
            className="rounded-full border-2 border-custard-50/40 px-[1.625rem] py-3 font-semibold text-custard-50 transition-colors duration-200 hover:border-custard-50"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
