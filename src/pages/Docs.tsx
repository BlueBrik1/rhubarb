import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";
import Section from "../components/docs/Section";
import CodeBlock from "../components/docs/CodeBlock";
import MappingTable from "../components/docs/MappingTable";
import Toc from "../components/docs/Toc";

const toc = [
  { id: "core-idea", label: "Core idea" },
  { id: "run-commands", label: "Run commands" },
  { id: "token-list", label: "Exact token list" },
  { id: "function-examples", label: "Function & call examples" },
  { id: "import-rules", label: "Import rules" },
  { id: "assignment-rules", label: "Assignment rules" },
  { id: "class-rules", label: "Class rules" },
  { id: "function-rules", label: "Function rules" },
  { id: "branching-rules", label: "Branching rules" },
  { id: "loop-rules", label: "Loop rules" },
  { id: "try-except-rules", label: "Try / except rules" },
  { id: "expression-rules", label: "Expression rules" },
  { id: "method-alias-rules", label: "Method alias rules" },
  { id: "reversed-line-modes", label: "Reversed line modes" },
  { id: "legacy-syntax", label: "Legacy syntax" },
  { id: "java-mode", label: "Java ∫ mode" },
  { id: "checklist-to-rhubarb", label: "Python → Rhubarb checklist" },
  { id: "checklist-to-python", label: "Rhubarb → Python checklist" },
  { id: "ai-prompt", label: "Prompt for another AI" },
  { id: "complete-example", label: "Complete example" },
];

const tokenRows = [
  ["import module", "⸘bաhúբ⸘ module ∫"],
  ["import module as alias", "⸘áաcaբ module ⟜ alias ∫"],
  ["from module import names", "⸘bաhúբ⸘ names ⟜ module ∫"],
  ["name = value", "⸘lաgyբn⸘ name ⟜ value ∫"],
  ["class Name:", "Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk Name ∫"],
  ["class Name(Base):", "Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk Name ⟜ Base ∫"],
  ["def name(args):", "Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt name ⟪hաváբ⟫ args ⟪vաgeբ ∫"],
  ["for item in collection:", "⸘jաrjբ item ⟜ collection ∫"],
  ["for _ in range(n):", "⸘kաröբz⸘ n ∫"],
  ["while condition:", "⸘aաígբ condition ∫"],
  ["if condition:", "⸘hա⸘ condition ∫"],
  ["elif condition:", "⸘mաs-բa⸘ condition ∫"],
  ["else:", "⸘kաlöբbeգ⸘ ∫"],
  ["try:", "⸘pաóbբ⸘ ∫"],
  ["except:", "⸘jաj⸘ ∫"],
  ["except Error:", "⸘jաj⸘ Error ∫"],
  ["return value", "⸘vաssբa⸘ value ∫"],
  ["print(value)", "⸘kաpdբ value ∫"],
  ["call(args)", "call⟪hաváբ⟫args⟪vաgeբ"],
];

const callRows = [
  ["fn()", "fn⟪hաváբ⟫⟪vաgeբ"],
  ["fn(a, b)", "fn⟪hաváբ⟫a, b⟪vաgeբ"],
  ["obj.method()", "obj.method⟪hաváբ⟫⟪vաgeբ"],
];

const aliasRows = [
  [".upper", ".nagybetű", ".nաgyբetգ"],
  [".lower", ".kisbetű", ".kաsbբtű"],
  [".split", ".darabol", ".dաraբol"],
  [".join", ".összeragaszt", ".öաszբraգasդt"],
  [".startswith", ".kezdődik", ".kաzdբdiգ"],
  [".endswith", ".végződik", ".vաgzբdiգ"],
  [".strip", ".csupaszít", ".cաupբszգt"],
  [".rstrip", ".jobbcsupaszít", ".jաbbբsuգasդít"],
  [".lstrip", ".balcsupaszít", ".bաlcբupգszդt"],
  [".replace", ".csereberél", ".cաerբbeգél"],
  [".find", ".keres", ".kաreբ"],
  [".count", ".számol", ".sաámբl"],
  [".append", ".hozzáfűz", ".hաzzբfűգ"],
  [".extend", ".kibővít", ".kաbőբít"],
  [".insert", ".bedug", ".bաduբ"],
  [".pop", ".kidob", ".kաdoբ"],
  [".sort", ".rendez", ".rաndբz"],
  [".copy", ".másolat", ".mաsoբat"],
];

const legacyRows = [
  ["import module", "@+ module"],
  ["import module as alias", "@+ module => alias"],
  ["from module import names", "@+ names <- module"],
  ["name = value", "@= name <- value"],
  ["class Name:", "@# Name"],
  ["class Name(Base):", "@# Name < Base"],
  ["def name(args):", "@! name $^--args--^$"],
  ["for item in collection:", "@> item <- collection"],
  ["for _ in range(n):", "@@ n"],
  ["while condition:", "@~ condition"],
  ["if condition:", "@? condition"],
  ["elif condition:", "@?? condition"],
  ["else:", "@:"],
  ["try:", "@!:"],
  ["except Error:", "@!! Error"],
  ["except:", "@!!"],
  ["return value", "<< value"],
  ["print(value)", "~> value"],
  ["call(args)", "call$^--args--^$"],
];

const beginnerRows = [
  ["print(value)", "say value"],
  ["input(prompt)", "ask prompt"],
  ["name = value", "set name = value"],
  ["for _ in range(n):", "repeat n:"],
];

export default function Docs() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".docs-section", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: "power3.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 85%" },
      });
    },
    { scope: rootRef }
  );

  return (
    <main ref={rootRef} className="px-6 pb-24 pt-36 md:pt-44">
      <div className="mx-auto max-w-3xl text-center lg:max-w-none">
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-rhubarb-500">
          Rhubarb Language Spec
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-rhubarb-950 sm:text-5xl">
          The actual documentation.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-rhubarb-900/70">
          Turns out "really easy" meant "read every word on this page first."
          This is the real spec. No sarcasm below this line.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-12 lg:grid-cols-[14rem_1fr]">
        <div className="sticky top-28 self-start">
          <Toc items={toc} />
        </div>

        <div className="min-w-0">
          <Section id="core-idea" title="Core idea">
            <p>
              Rhubarb is a tiny language that translates into Python. A{" "}
              <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">
                .rhubarb
              </code>{" "}
              file can contain normal Python, but the official Rhubarbian
              syntax replaces Python keywords with intentionally awkward
              Hungarian/Armenian-looking tokens.
            </p>
            <p>
              Use this page as a translator guide. Someone who knows Python
              should be able to translate Python to Rhubarb and Rhubarb back
              to Python from these rules.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Rhubarb preserves Python indentation rules. Blocks are still
                created by indenting the next lines.
              </li>
              <li>Rhubarb expressions are mostly Python expressions.</li>
              <li>
                Python strings stay normal strings. User-facing text can be
                English.
              </li>
              <li>
                Rhubarb statement lines often end with <code>∫</code>. In{" "}
                <code>.rhubarb</code> Python mode, a trailing <code>∫</code>{" "}
                is removed from statements that match a recognized Rhubarb
                keyword pattern (import, assignment, class, def, for, while,
                if/elif/else, try/except, return, print). On lines that
                don't match any recognized pattern — including plain Python
                fallback lines and malformed Rhubarb lines — a trailing{" "}
                <code>∫</code> is <strong>not</strong> removed; it is
                converted to <code>;</code> instead, same as inside
                expressions. The result is still valid Python (a trailing
                semicolon is harmless), but it is not actually removed.
              </li>
              <li>
                Inside expressions, <code>∫</code> translates to{" "}
                <code>;</code>. This same <code>;</code>-conversion (rather
                than removal) also applies to trailing <code>∫</code> on any
                fallback line, per above.
              </li>
              <li>
                Normal Python lines are allowed if they do not match Rhubarb
                syntax.
              </li>
            </ul>
          </Section>

          <Section id="run-commands" title="Run commands">
            <CodeBlock
              code={`python3 rhubarb.py file.rhubarb
python3 rhubarb.py file.rhubarb --python
python3 rhubarb.py file.rjava --java
python3 rhubarb_ide.py`}
            />
          </Section>

          <Section id="token-list" title="Exact token list">
            <p>
              Use the Armenianized token first. The plain Hungarian token is
              also accepted for most rules, but generated Rhubarbian should
              prefer the Armenianized form.
            </p>
            <MappingTable columns={["Python", "Rhubarb"]} rows={tokenRows} />
            <p className="text-sm text-rhubarb-900/60">
              Important: the call closer token is exactly{" "}
              <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-rhubarb-700">
                ⟪vաgeբ
              </code>
              . It does not include the final <code>⟫</code>.
            </p>
          </Section>

          <Section id="function-examples" title="Function and call examples">
            <CodeBlock
              label="shout.py"
              code={`def shout(word):
    return word.upper() + "!"

print(shout("hello"))`}
            />
            <CodeBlock
              label="shout.rhubarb"
              code={`Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt shout ⟪hաváբ⟫ word ⟪vաgeբ ∫
    ⸘vաssբa⸘ word.nաgyբetգ⟪hաváբ⟫⟪vաgeբ + "!" ∫

⸘kաpdբ shout⟪hաváբ⟫"hello"⟪vաgeբ ∫`}
            />
          </Section>

          <Section id="import-rules" title="Import rules">
            <CodeBlock code={`⸘bաhúբ⸘ subprocess ∫`} />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock code={`import subprocess`} />

            <CodeBlock code={`⸘áաcaբ tkinter ⟜ tk ∫`} />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock code={`import tkinter as tk`} />

            <CodeBlock code={`⸘bաhúբ⸘ Path ⟜ pathlib ∫`} />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock code={`from pathlib import Path`} />

            <p>Multiple imported names are allowed:</p>
            <CodeBlock
              code={`⸘bաhúբ⸘ filedialog, messagebox, simpledialog ⟜ tkinter ∫`}
            />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock
              code={`from tkinter import filedialog, messagebox, simpledialog`}
            />
          </Section>

          <Section id="assignment-rules" title="Assignment rules">
            <CodeBlock
              code={`⸘lաgyբn⸘ x ⟜ 5 ∫
⸘lաgyբn⸘ name ⟜ "Mihir" ∫
⸘lաgyբn⸘ nums ⟜ [2, 7, 11, 15] ∫`}
            />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock
              code={`x = 5
name = "Mihir"
nums = [2, 7, 11, 15]`}
            />
            <p>
              The <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⟜</code>{" "}
              symbol is the Rhubarb assignment/import/base-class separator.
            </p>
          </Section>

          <Section id="class-rules" title="Class rules">
            <CodeBlock
              label="app.py"
              code={`class App:
    pass

class Window(tk.Tk):
    pass`}
            />
            <CodeBlock
              label="app.rhubarb"
              code={`Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk App ∫
    pass

Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk Window ⟜ tk.Tk ∫
    pass`}
            />
            <p className="text-sm text-rhubarb-900/60">Accepted older class tokens:</p>
            <CodeBlock
              code={`Legeslegmegszentségteleníttethetetlenebbjeiteknek
⸘osztály⸘`}
            />
          </Section>

          <Section id="function-rules" title="Function rules">
            <CodeBlock
              label="add.py"
              code={`def add(a, b):
    return a + b`}
            />
            <CodeBlock
              label="add.rhubarb"
              code={`Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt add ⟪hաváբ⟫ a, b ⟪vաgeբ ∫
    ⸘vաssբa⸘ a + b ∫`}
            />

            <div className="rounded-2xl border border-rhubarb-300 bg-custard-100 p-5">
              <p className="font-display font-semibold text-rhubarb-700">
                Known limitation
              </p>
              <p className="mt-2">
                The <code>def</code> pattern only matches when the call
                closer <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⟪vաgeբ</code>{" "}
                is the last thing on the line (before the trailing{" "}
                <code>∫</code>). Anything after the closer — most commonly a
                return-type annotation like <code>-&gt; int</code> — prevents
                the line from being recognized as a function definition at
                all. In that case the line silently falls through to generic
                fallback handling: the function-name token, parentheses, and
                Rhubarb-isms are <strong>not</strong> translated, and the
                result is broken Python. Argument-level type hints inside the
                parentheses (e.g. <code>height: list[int]</code>) are
                unaffected and work fine — only a return-type annotation
                trailing the closing{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⟪vաgeբ</code>{" "}
                causes a problem. If you need to preserve a return type,
                write the line as a plain Python fallback <code>def</code>{" "}
                instead of using the Rhubarb function token.
              </p>
              <CodeBlock
                code={`Works:    Elաelբ...rt trap ⟪hաváբ⟫ self, height: list[int] ⟪vաgeբ ∫
Breaks:   Elաelբ...rt trap ⟪hաváբ⟫ self, height: list[int] ⟪vաgeբ -> int ∫`}
              />
            </div>

            <p className="text-sm text-rhubarb-900/60">Accepted older function tokens:</p>
            <CodeBlock
              code={`Elkelkáposztástalaníthatatlanságoskodásaitokért
⸘függvény⸘`}
            />
          </Section>

          <Section id="branching-rules" title="Branching rules">
            <CodeBlock
              label="branch.py"
              code={`if x > 10:
    print("big")
elif x == 10:
    print("ten")
else:
    print("small")`}
            />
            <CodeBlock
              label="branch.rhubarb"
              code={`⸘hա⸘ x > 10 ∫
    ⸘kաpdբ "big" ∫
⸘mաs-բa⸘ x == 10 ∫
    ⸘kաpdբ "ten" ∫
⸘kաlöբbeգ⸘ ∫
    ⸘kաpdբ "small" ∫`}
            />
          </Section>

          <Section id="loop-rules" title="Loop rules">
            <CodeBlock
              label="loop.py"
              code={`for n in range(1, 6):
    print(n)

for _ in range(3):
    print("again")

while running:
    print("tick")`}
            />
            <CodeBlock
              label="loop.rhubarb"
              code={`⸘jաrjբ n ⟜ range⟪hաváբ⟫1, 6⟪vաgeբ ∫
    ⸘kաpdբ n ∫

⸘kաröբz⸘ 3 ∫
    ⸘kաpdբ "again" ∫

⸘aաígբ running ∫
    ⸘kաpdբ "tick" ∫`}
            />
          </Section>

          <Section id="try-except-rules" title="Try / except rules">
            <CodeBlock
              label="risky.py"
              code={`try:
    risky()
except ValueError as error:
    print(error)
except:
    print("unknown")`}
            />
            <CodeBlock
              label="risky.rhubarb"
              code={`⸘pաóbբ⸘ ∫
    risky⟪hաváբ⟫⟪vաgeբ ∫
⸘jաj⸘ ValueError as error ∫
    ⸘kաpdբ error ∫
⸘jաj⸘ ∫
    ⸘kաpdբ "unknown" ∫`}
            />
          </Section>

          <Section id="expression-rules" title="Expression rules">
            <p>Most expressions stay Python:</p>
            <CodeBlock
              code={`x + y
nums[0]
data["key"]
len⟪hաváբ⟫items⟪vաgeբ
lambda path: path.name.lower⟪hաváբ⟫⟪vաgeբ
f"Hello {name}"`}
            />
            <p>Translate call parentheses like this:</p>
            <MappingTable columns={["Python", "Rhubarb"]} rows={callRows} />
            <p className="text-sm text-rhubarb-900/60">
              Normal Python parentheses can still work in fallback Python
              lines, but official Rhubarbian should use the call tokens.
            </p>
          </Section>

          <Section id="method-alias-rules" title="Method alias rules">
            <p>
              Rhubarb method aliases translate to Python method names. Both
              the plain Hungarian and Armenianized versions are accepted, but
              generated Rhubarbian should prefer Armenianized aliases.
            </p>
            <MappingTable
              columns={["Python method", "Plain Rhubarb", "Armenianized Rhubarb"]}
              rows={aliasRows}
            />
            <p>Example:</p>
            <CodeBlock
              code={`⸘lաgyբn⸘ name ⟜ "rhubarb" ∫
⸘kաpdբ name.nաgyբetգ⟪hաváբ⟫⟪vաgeբ ∫`}
            />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock
              code={`name = "rhubarb"
print(name.upper())`}
            />
          </Section>

          <Section id="reversed-line-modes" title="Reversed line modes">
            <p>Rhubarb can read source where each line is written backwards.</p>

            <h3 className="font-display text-lg font-semibold text-rhubarb-950">
              Partial reverse mode
            </h3>
            <p>
              If any of these markers appears in the first 8 lines, Rhubarb
              reverses every non-comment code line after preserving normal
              leading indentation:
            </p>
            <CodeBlock
              code={`# RHUBARB_REVERSE_LINES
# SENIL_ESREVER_BRAHBUHR
# SENIL_ESREVER_BRABUHR`}
            />
            <p>Example:</p>
            <CodeBlock
              code={`# RHUBARB_REVERSE_LINES
∫ "olleh" բdpաk⸘`}
            />
            <p className="text-sm text-rhubarb-900/60">becomes:</p>
            <CodeBlock code={`⸘kաpdբ "hello" ∫`} />
            <p className="text-sm text-rhubarb-900/60">then translates to:</p>
            <CodeBlock code={`print("hello")`} />

            <h3 className="font-display text-lg font-semibold text-rhubarb-950">
              Full reverse mode
            </h3>
            <p>
              If this marker appears in the first 8 lines, Rhubarb reverses
              every nonblank line completely:
            </p>
            <CodeBlock code={`SENIL_ESREVER_BRABUHR #`} />
            <p>
              Because full reversal would move indentation to the right side,
              indentation is encoded with visible{" "}
              <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">␠</code>{" "}
              characters at the end of the reversed line.
            </p>
            <p>Example forward Rhubarb:</p>
            <CodeBlock
              code={`⸘hա⸘ True ∫
    ⸘kաpdբ "yes" ∫`}
            />
            <p>Full-reversed Rhubarb:</p>
            <CodeBlock
              code={`SENIL_ESREVER_BRABUHR #
∫ eurT ⸘աh⸘
∫ "sey" բdpաk⸘␠␠␠␠`}
            />
            <p className="text-sm text-rhubarb-900/60">
              The four trailing <code>␠</code> characters become four real
              leading spaces after unreversing.
            </p>
          </Section>

          <Section id="legacy-syntax" title="Legacy syntax">
            <p>Old Rhubarb syntax is still accepted.</p>
            <MappingTable columns={["Python", "Legacy Rhubarb"]} rows={legacyRows} />
            <p>Beginner shortcut syntax is also accepted:</p>
            <MappingTable columns={["Beginner shortcut", "Python"]} rows={beginnerRows} />
          </Section>

          <Section id="java-mode" title="Java ∫ mode">
            <p>
              <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">
                .rjava
              </code>{" "}
              files are Java-like files where <code>∫</code> means{" "}
              <code>;</code>.
            </p>
            <p>Input:</p>
            <CodeBlock
              label="Main.rjava"
              code={`public class Main {
    public static void main(String[] args) {
        System.out.println("hello")∫
    }
}`}
            />
            <p>Command:</p>
            <CodeBlock code={`python3 rhubarb.py examples/Main.rjava --java`} />
            <p>Output:</p>
            <CodeBlock
              label="Main.java"
              code={`public class Main {
    public static void main(String[] args) {
        System.out.println("hello");
    }
}`}
            />
          </Section>

          <Section id="checklist-to-rhubarb" title="Python → Rhubarb translation checklist">
            <p>When translating Python into official Rhubarbian:</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Keep indentation exactly like Python.</li>
              <li>
                Replace <code>import x</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘bաhúբ⸘ x ∫</code>.
              </li>
              <li>
                Replace <code>import x as y</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘áաcaբ x ⟜ y ∫</code>.
              </li>
              <li>
                Replace <code>from x import y</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘bաhúբ⸘ y ⟜ x ∫</code>.
              </li>
              <li>
                Replace assignment <code>name = value</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘lաgyբn⸘ name ⟜ value ∫</code>.
              </li>
              <li>Replace class definitions with the long class token.</li>
              <li>
                Replace function definitions with the long function token and
                call delimiters. Do not add anything after the closing{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⟪vաgeբ</code>{" "}
                (e.g. a <code>-&gt; ReturnType</code> annotation) — the
                function token only translates correctly when the closer is
                the last thing on the line; otherwise leave the{" "}
                <code>def</code> as plain Python.
              </li>
              <li>
                Replace <code>for item in thing:</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘jաrjբ item ⟜ thing ∫</code>.
              </li>
              <li>
                Replace <code>for _ in range(n):</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘kաröբz⸘ n ∫</code>{" "}
                when it is a simple repeat loop.
              </li>
              <li>
                Replace <code>while</code>, <code>if</code>, <code>elif</code>
                , <code>else</code>, <code>try</code>, <code>except</code>,{" "}
                <code>return</code>, and <code>print</code> with their Rhubarb
                tokens.
              </li>
              <li>
                Replace call parentheses in calls with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⟪hաváբ⟫</code> and{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⟪vաgeբ</code>.
              </li>
              <li>
                Replace common method names with aliases, such as{" "}
                <code>.upper()</code> to{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">.nաgyբetգ⟪hաváբ⟫⟪vաgeբ</code>.
              </li>
              <li>
                Keep strings in normal readable English unless the user asks
                otherwise.
              </li>
              <li>
                Add <code>∫</code> to Rhubarb statement lines that use a
                recognized keyword token; it will be removed on translation.
                Avoid relying on <code>∫</code> for plain Python fallback
                lines, since it converts to <code>;</code> there instead of
                being removed.
              </li>
              <li>
                If full reverse mode is requested, reverse every nonblank
                line and put one trailing <code>␠</code> for each leading
                indentation space.
              </li>
            </ol>
          </Section>

          <Section id="checklist-to-python" title="Rhubarb → Python translation checklist">
            <p>When translating Rhubarb back into Python:</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>If a reverse marker is present, unreverse the lines first.</li>
              <li>Convert call delimiters back to parentheses.</li>
              <li>Convert method aliases back to Python method names.</li>
              <li>
                Convert <code>∫</code> to nothing at statement endings{" "}
                <em>for recognized keyword statements</em>; convert it to{" "}
                <code>;</code> inside expressions and on any line that falls
                through to generic/fallback handling (including a malformed{" "}
                <code>def</code> line — see the function-rules limitation
                above).
              </li>
              <li>Convert Rhubarb keyword tokens to Python keywords.</li>
              <li>Preserve indentation.</li>
              <li>Leave normal Python fallback lines as normal Python.</li>
            </ol>
          </Section>

          <Section id="ai-prompt" title="Prompt for another AI">
            <p>
              You can give this prompt to ChatGPT, Claude, or another model:
            </p>
            <CodeBlock
              code={`Translate between Python and Rhubarb using these rules:

Rhubarb is Python with alternate tokens. Preserve Python indentation. Strings can stay English. Expressions are Python expressions except calls use ⟪hաváբ⟫ for ( and ⟪vաgeբ for ). Statement lines may end with ∫.

Use these mappings:
import module => ⸘bաhúբ⸘ module ∫
import module as alias => ⸘áաcaբ module ⟜ alias ∫
from module import names => ⸘bաhúբ⸘ names ⟜ module ∫
name = value => ⸘lաgyբn⸘ name ⟜ value ∫
class Name => Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk Name ∫
class Name(Base) => Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk Name ⟜ Base ∫
def name(args) => Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt name ⟪hաváբ⟫ args ⟪vաgeբ ∫
for item in collection => ⸘jաrjբ item ⟜ collection ∫
for _ in range(n) => ⸘kաröբz⸘ n ∫
while condition => ⸘aաígբ condition ∫
if condition => ⸘hա⸘ condition ∫
elif condition => ⸘mաs-բa⸘ condition ∫
else => ⸘kաlöբbeգ⸘ ∫
try => ⸘pաóbբ⸘ ∫
except Error => ⸘jաj⸘ Error ∫
except => ⸘jաj⸘ ∫
return value => ⸘vաssբa⸘ value ∫
print(value) => ⸘kաpdբ value ∫

Method aliases:
.upper => .nաgyբetգ
.lower => .kաsbբtű
.split => .dաraբol
.join => .öաszբraգasդt
.startswith => .kաzdբdiգ
.endswith => .vաgzբdiգ
.strip => .cաupբszգt
.rstrip => .jաbbբsuգasդít
.lstrip => .bաlcբupգszդt
.replace => .cաerբbeգél
.find => .kաreբ
.count => .sաámբl
.append => .hաzzբfűգ
.extend => .kաbőբít
.insert => .bաduբ
.pop => .kաdoբ
.sort => .rաndբz
.copy => .mաsoբat

If source begins with SENIL_ESREVER_BRABUHR #, every nonblank line after that is fully reversed and trailing ␠ characters represent leading indentation spaces.`}
            />
          </Section>

          <Section id="complete-example" title="Complete example">
            <CodeBlock
              label="counter.py"
              code={`class Counter:
    def __init__(self):
        self.items = []

    def add(self, value):
        self.items.append(value)
        return len(self.items)

counter = Counter()
for n in range(3):
    print(counter.add(n))`}
            />
            <CodeBlock
              label="counter.rhubarb"
              code={`Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk Counter ∫
    Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt __init__ ⟪hաváբ⟫ self ⟪vաgeբ ∫
        ⸘lաgyբn⸘ self.items ⟜ [] ∫

    Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt add ⟪hաváբ⟫ self, value ⟪vաgeբ ∫
        self.items.hաzzբfűգ⟪hաváբ⟫value⟪vաgeբ ∫
        ⸘vաssբa⸘ len⟪hաváբ⟫self.items⟪vաgeբ ∫

⸘lաgyբn⸘ counter ⟜ Counter⟪hաváբ⟫⟪vաgeբ ∫
⸘jաrjբ n ⟜ range⟪hաváբ⟫3⟪vաgeբ ∫
    ⸘kաpdբ counter.add⟪hաváբ⟫n⟪vաgeբ ∫`}
            />
          </Section>
        </div>
      </div>
    </main>
  );
}
