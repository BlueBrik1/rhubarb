import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
import { gsap } from "../lib/gsap";

const headlineLine1 = ["Write it.", "Encrypt it."];
const headlineLine2 = ["Ship it as", "Python."];

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-word", {
        yPercent: 120,
        opacity: 0,
        duration: 0.9,
        stagger: 0.07,
      })
        .from(
          ".hero-card",
          { y: 30, opacity: 0, duration: 0.8, ease: "back.out(1.4)" },
          "-=0.45"
        )
        .from(
          ".hero-sub",
          { y: 20, opacity: 0, duration: 0.7 },
          "-=0.4"
        )
        .from(
          ".hero-cta-enter",
          { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 },
          "-=0.4"
        )
        .from(
          ".hero-blob",
          { scale: 0, opacity: 0, duration: 0.8, stagger: 0.12, ease: "back.out(2)" },
          "-=0.6"
        );

      // the card sits flush for a beat, like it's freshly hung, then one
      // corner's "screw" gives out and it swings down into its resting tilt
      gsap.to(".hero-card", {
        rotate: 3,
        duration: 0.45,
        delay: 2.3,
        ease: "back.out(3)",
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative overflow-hidden px-6 pt-40 pb-24 md:pt-48 md:pb-32"
    >
      {/* decorative shapes */}
      <div
        className="hero-blob animate-float pointer-events-none absolute -top-10 right-[8%] h-40 w-28 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-rhubarb-300/70 blur-[1px] [--tw-rotate:-8deg]"
        aria-hidden
      />
      <div
        className="hero-blob animate-float pointer-events-none absolute top-1/3 left-[4%] h-24 w-24 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-leaf-400/60 [--tw-rotate:12deg]"
        style={{ animationDelay: "1.2s" }}
        aria-hidden
      />
      <div
        className="hero-blob animate-float pointer-events-none absolute bottom-10 right-[20%] h-16 w-16 rounded-[50%_50%_40%_60%/40%_60%_50%_50%] bg-custard-200"
        style={{ animationDelay: "0.6s" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1 className="font-display text-6xl font-bold leading-[0.98] tracking-tight text-rhubarb-950 sm:text-7xl">
          <span className="block overflow-hidden">
            {headlineLine1.map((word, i) => (
              <span
                key={i}
                className={`hero-word-wrap inline-block overflow-hidden pb-1 ${
                  i < headlineLine1.length - 1 ? "mr-3 sm:mr-4" : ""
                }`}
              >
                <span className="hero-word inline-block">{word}</span>
              </span>
            ))}
          </span>
          <span className="block overflow-hidden">
            {headlineLine2.map((word, i) => (
              <span
                key={i}
                className={`hero-word-wrap inline-block overflow-hidden pb-1 ${
                  i < headlineLine2.length - 1 ? "mr-3 sm:mr-4" : ""
                }`}
              >
                <span className="hero-word inline-block text-rhubarb-500">{word}</span>
              </span>
            ))}
          </span>
        </h1>

        <div className="hero-card origin-top-left relative mx-auto mt-10 w-full max-w-2xl rounded-2xl border border-rhubarb-900/10 bg-rhubarb-950 p-6 text-left font-mono text-sm shadow-2xl shadow-rhubarb-900/30">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rhubarb-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-custard-200/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-leaf-400/80" />
            <span className="ml-2 text-xs text-custard-100/40">Rhubarb IDE</span>
          </div>
          <pre className="overflow-x-hidden leading-relaxed text-custard-100">
{`⸘lաgyբn⸘꧃néա꧃⟜꧃"rhubarb"꧃∫
⸘kաpdբ꧃"Language: "꧃+꧃néա.nաgyբetգ⟪hաváբ⟫⟪vաgeբ꧃∫

Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃kiաltբs꧃⟪hաváբ⟫꧃szա꧃⟪vաgeբ꧃∫
꧃꧃꧃꧃⸘vաssբa⸘꧃szա.nաgyբetգ⟪hաváբ⟫⟪vաgeբ꧃+꧃"Hello World!"꧃∫`}
          </pre>
          <p className="mt-4 border-t border-custard-50/10 pt-3 text-xs text-custard-100/50">
            garden.rhubarb
          </p>
        </div>

        <p className="hero-sub mt-10 max-w-md text-lg leading-relaxed text-rhubarb-900/70">
          Rhubarb compiles straight to Python. Write it in the public
          dialect and anyone with the IDE can open and run it — or generate
          a key and turn the same code into a private dialect that looks
          completely encrypted to everyone else. The same key decrypts it
          back to Python; a different key never will.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <div className="hero-cta-enter">
            <a
              href="#install"
              className="inline-flex items-center justify-center rounded-full border-2 border-transparent bg-rhubarb-600 px-7 py-3.5 font-semibold text-custard-50 shadow-lg shadow-rhubarb-600/25 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-rhubarb-700"
            >
              Get the IDE
            </a>
          </div>
          <div className="hero-cta-enter">
            <Link
              to="/docs"
              className="inline-flex items-center justify-center rounded-full border-2 border-rhubarb-900/15 px-7 py-3.5 font-semibold text-rhubarb-900 transition-colors duration-200 hover:border-rhubarb-900/30"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
