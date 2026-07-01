import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";

const KEYWORDS = [
  "def",
  "class",
  "return",
  "import",
  "from",
  "for",
  "while",
  "if",
  "elif",
  "else",
  "try",
  "except",
  "print",
  "as",
  "pass",
  "lambda",
];

const samples = [
  {
    file: "garden.rhubarb",
    code: `⸘lաgyբn⸘ néա ⟜ "rhubarb" ∫
⸘kաpdբ "Language: " + néա.nաgyբetգ⟪hաváբ⟫⟪vաgeբ ∫

Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt kiաltբs ⟪hաváբ⟫ szա ⟪vաgeբ ∫
    ⸘vաssբa⸘ szա.nաgyբetգ⟪hաváբ⟫⟪vաgeբ + "!!!" ∫`,
  },
  {
    file: "loop.rhubarb",
    code: `⸘jաrjբ n ⟜ range⟪hաváբ⟫1, 6⟪vաgeբ ∫
    ⸘kաpdբ n ∫

⸘kաröբz⸘ 3 ∫
    ⸘kաpdբ "again" ∫

⸘aաígբ running ∫
    ⸘kաpdբ "tick" ∫`,
  },
  {
    file: "branch.rhubarb",
    code: `⸘hա⸘ x > 10 ∫
    ⸘kաpdբ "big" ∫
⸘mաs-բa⸘ x == 10 ∫
    ⸘kաpdբ "ten" ∫
⸘kաlöբbeգ⸘ ∫
    ⸘kաpdբ "small" ∫`,
  },
];

function highlight(line: string, key: number) {
  const tokenPattern = /(#.*$)|("(?:[^"\\]|\\.)*")|(->)|(\b\d+(?:\.\.\d+)?\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*\b)/g;
  const parts: { text: string; cls: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(line))) {
    if (match.index > lastIndex) {
      parts.push({ text: line.slice(lastIndex, match.index), cls: "text-custard-100/90" });
    }
    const [full, comment, str, arrow, num, word] = match;
    if (comment) parts.push({ text: full, cls: "italic text-custard-50/40" });
    else if (str) parts.push({ text: full, cls: "text-leaf-300" });
    else if (arrow) parts.push({ text: full, cls: "text-rhubarb-300" });
    else if (num) parts.push({ text: full, cls: "text-custard-200" });
    else if (word && KEYWORDS.includes(word))
      parts.push({ text: full, cls: "text-rhubarb-300 font-medium" });
    else parts.push({ text: full, cls: "text-custard-100/90" });
    lastIndex = match.index + full.length;
  }
  if (lastIndex < line.length) {
    parts.push({ text: line.slice(lastIndex), cls: "text-custard-100/90" });
  }

  return (
    <span key={key} className="block">
      {parts.map((p, i) => (
        <span key={i} className={p.cls}>
          {p.text}
        </span>
      ))}
      {line.length === 0 && " "}
    </span>
  );
}

export default function CodeShowcase() {
  const [active, setActive] = useState(0);
  const codeRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".showcase-reveal", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      gsap.fromTo(
        codeRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    },
    { dependencies: [active], scope: sectionRef }
  );

  return (
    <section id="syntax" ref={sectionRef} className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="showcase-reveal mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-rhubarb-950 sm:text-5xl">
            Read it once, know it.
          </h2>
          <p className="mt-4 text-lg text-rhubarb-900/70">
            Three real .rhubarb files, straight from the IDE. Totally
            self-explanatory — every token is just a friendly little word,
            like ⸘jաrjբ. If that's somehow not obvious, there's a full
            translation guide in the docs. We don't know why you'd need it.
          </p>
        </div>

        <div className="showcase-reveal mt-12 overflow-hidden rounded-3xl border border-rhubarb-900/10 bg-rhubarb-950 shadow-2xl shadow-rhubarb-900/20">
          <div className="flex items-center gap-1 border-b border-custard-50/10 bg-rhubarb-900/40 px-3 pt-3">
            <span className="mr-2 hidden text-xs text-custard-100/40 sm:inline">
              Rhubarb IDE —
            </span>
            {samples.map((s, i) => (
              <button
                key={s.file}
                onClick={() => setActive(i)}
                className={`rounded-t-xl px-4 py-2.5 font-mono text-sm transition-colors ${
                  active === i
                    ? "bg-rhubarb-950 text-custard-50"
                    : "text-custard-100/50 hover:text-custard-100/80"
                }`}
              >
                {s.file}
              </button>
            ))}
          </div>
          <div ref={codeRef} className="px-6 py-7">
            <pre className="overflow-x-auto font-mono text-[15px] leading-7">
              {samples[active].code.split("\n").map((line, i) => highlight(line, i))}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
