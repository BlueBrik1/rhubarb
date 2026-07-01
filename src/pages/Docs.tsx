import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap";
import Section from "../components/docs/Section";
import CodeBlock from "../components/docs/CodeBlock";
import MappingTable from "../components/docs/MappingTable";
import Toc from "../components/docs/Toc";

const toc = [
  { id: "mandatory-space", label: "The mandatory space character" },
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
  { id: "public-dialect", label: "Writing public-dialect Rhubarb" },
  { id: "custom-key", label: "Custom key & /mirror" },
  { id: "launching", label: "IDE: Launching" },
  { id: "tabs", label: "IDE: Tabs" },
  { id: "sidebar", label: "IDE: Sidebar & file tree" },
  { id: "search-replace", label: "IDE: Search & replace" },
  { id: "syntax-highlighting", label: "IDE: Syntax highlighting" },
  { id: "keyboard-shortcuts", label: "IDE: Keyboard shortcuts" },
  { id: "output-terminal", label: "IDE: Output, Terminal, Run" },
  { id: "new-window", label: "IDE: New window" },
  { id: "codebase-overview", label: "Codebase overview" },
];

const tokenRows = [
  ["import module", "⸘bաhúբ⸘꧃module꧃∫"],
  ["import module as alias", "⸘áաcaբ꧃module꧃⟜꧃alias꧃∫"],
  ["from module import names", "⸘bաhúբ⸘꧃names꧃⟜꧃module꧃∫"],
  ["name = value", "⸘lաgyբn⸘꧃name꧃⟜꧃value꧃∫"],
  ["class Name:", "Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk꧃Name꧃∫"],
  ["class Name(Base):", "Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk꧃Name꧃⟜꧃Base꧃∫"],
  ["def name(args):", "Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃name꧃⟪hաváբ⟫꧃args꧃⟪vաgeբ꧃∫"],
  ["for item in collection:", "⸘jաrjբ꧃item꧃⟜꧃collection꧃∫"],
  ["for _ in range(n):", "⸘kաröբz⸘꧃n꧃∫"],
  ["while condition:", "⸘aաígբ꧃condition꧃∫"],
  ["if condition:", "⸘hա⸘꧃condition꧃∫"],
  ["elif condition:", "⸘mաs-բa⸘꧃condition꧃∫"],
  ["else:", "⸘kաlöբbeգ⸘꧃∫"],
  ["try:", "⸘pաóbբ⸘꧃∫"],
  ["except:", "⸘jաj⸘꧃∫"],
  ["except Error:", "⸘jաj⸘꧃Error꧃∫"],
  ["return value", "⸘vաssբa⸘꧃value꧃∫"],
  ["print(value)", "⸘kաpdբ꧃value꧃∫"],
  ["call(args)", "call⟪hաváբ⟫args⟪vաgeբ"],
];

const callRows = [
  ["fn()", "fn⟪hաváբ⟫⟪vաgeբ"],
  ["fn(a, b)", "fn⟪hաváբ⟫a,꧃b⟪vաgeբ"],
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
  ["import module", "@+꧃module"],
  ["import module as alias", "@+꧃module꧃=>꧃alias"],
  ["from module import names", "@+꧃names꧃<-꧃module"],
  ["name = value", "@=꧃name꧃<-꧃value"],
  ["class Name:", "@# Name"],
  ["class Name(Base):", "@# Name < Base"],
  ["def name(args):", "@!꧃name꧃$^--args--^$"],
  ["for item in collection:", "@>꧃item꧃<-꧃collection"],
  ["for _ in range(n):", "@@꧃n"],
  ["while condition:", "@~꧃condition"],
  ["if condition:", "@?꧃condition"],
  ["elif condition:", "@??꧃condition"],
  ["else:", "@:"],
  ["try:", "@!:"],
  ["except Error:", "@!!꧃Error"],
  ["except:", "@!!"],
  ["return value", "<<꧃value"],
  ["print(value)", "~>꧃value"],
  ["call(args)", "call$^--args--^$"],
];

const beginnerRows = [
  ["print(value)", "say꧃value"],
  ["input(prompt)", "ask꧃prompt"],
  ["name = value", "set꧃name꧃=꧃value"],
  ["for _ in range(n):", "repeat꧃n:"],
];

const sidebarIconRows = [
  ["Folder with +", "New Folder, created inline inside whatever's currently selected."],
  ["File with +", "New File, created inline inside whatever's currently selected."],
  ["Folder", "Open Folder — switches the whole workspace (Ctrl+Shift+O)."],
  ["File", "Open File — native file picker (Ctrl+O)."],
  ["Magnifying glass", "Toggle the Search panel (Ctrl+Shift+F)."],
  ["Key", "Open the Keys panel."],
];

const shortcutRows = [
  ["Ctrl+S", "Save the active tab"],
  ["Ctrl+N", "New scratch tab (not written to disk until you save it)"],
  ["Ctrl+O", "Open File (native picker)"],
  ["Ctrl+Shift+O", "Open Folder (switch workspace)"],
  ["Ctrl+Shift+N", "New Window"],
  ["Ctrl+W", "Close the active tab"],
  ["Ctrl+Tab / Ctrl+Shift+Tab", "Next / previous tab"],
  ["Ctrl+1 – Ctrl+9", "Jump to tab N (Ctrl+9 always means the last tab)"],
  ["Ctrl+Enter or F5", "Run the active file"],
  ["Ctrl+Shift+P", "Show the translated-Python preview"],
  ["Ctrl+Shift+F", "Toggle the workspace Search panel"],
  ["Escape", "Close whatever modal or context menu is currently on top"],
];

const codebaseRows = [
  [
    "rhubarb.py",
    "The compiler: translate() (Rhubarb → Python), migrate_spaces_to_mandatory(), the mandatory-space validator (enforce_mandatory_space_character), the string/comment/f-string-aware line scanner (scan_code_segments), reverse-line-mode support, and the TokenSet dataclass that both the public vocabulary (DEFAULT_TOKENS) and any custom keyed vocabulary plug into. Runnable standalone with --python, --java, or --migrate.",
  ],
  [
    "rhubarb_encode.py",
    "The compiler's other direction: a Python-AST-based encoder that turns .py source into Rhubarb shaped by whichever TokenSet it's given. Powers the /mirror terminal command; not exposed as its own CLI flag.",
  ],
  [
    "rhubarb_keys.py",
    "Key generation (generate_key) and deterministic TokenSet derivation (derive_token_set) for the custom private dialect — a single, symmetric key drives both directions.",
  ],
  [
    "rhubarb_ide.py",
    "The desktop app: a pywebview Api class exposed to the frontend, covering the file tree, tabs, search/replace, run/translate, the terminal (terminal_run, get_terminal_cwd), the /mirror encoder (_mirror_directory), and key storage (save_keys, get_keys_status, and friends).",
  ],
  [
    "rhubarb_ide_tk_backup.py",
    "The IDE's original Tkinter version, kept for reference; no longer maintained or wired up to newer features.",
  ],
  [
    "rhubarb-ide-webui/",
    "The React + TypeScript + Tailwind frontend: a CodeMirror 6 editor, tabs, sidebar with drag-and-drop and inline create, workspace search, the Keys modal, and the Output/Terminal bottom panel. Built with Vite; npm run build outputs to dist/, which rhubarb_ide.py loads directly as its window contents.",
  ],
  [
    "examples/, test.rhubarb, ereg/, JavaSpace/",
    "Sample .rhubarb programs, including partial- and full-reverse-line-mode demonstrations and a complete Tkinter application written entirely in Rhubarb.",
  ],
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
          Rhubarb Language Spec &amp; IDE Guide
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-rhubarb-950 sm:text-5xl">
          The complete reference.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-rhubarb-900/70">
          Everything the language and the desktop IDE actually do, in full —
          the tokens, the mandatory space character, the IDE's terminal and
          key-derived private dialect, and how to translate in either
          direction by hand.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-12 lg:grid-cols-[16rem_1fr]">
        <div className="sticky top-28 self-start">
          <Toc items={toc} />
        </div>

        <div className="min-w-0">
          <Section id="mandatory-space" title="The mandatory space character">
            <p>
              Rhubarb has no ordinary space or tab character in its
              structural syntax. Every gap between tokens — including
              indentation — must be written as the mandatory space character{" "}
              <strong>꧃</strong> (U+A9C3, Javanese Pangrangkep), not a normal
              space or tab.
            </p>
            <CodeBlock
              code={`say "hello"          ✗ rejected — normal spaces between tokens
say꧃"hello"          ✓ correct`}
            />
            <p>
              This applies uniformly to every Rhubarb dialect on this page:
              the Armenianized tokens, the plain Hungarian tokens, the legacy{" "}
              <code>@</code>-prefixed syntax, the beginner shortcuts, and any
              custom private dialect generated from a key (see{" "}
              <a href="#custom-key" className="text-rhubarb-600 underline">
                Custom key &amp; /mirror
              </a>
              ). It does <strong>not</strong> apply inside string literals or
              comments — those stay perfectly normal, readable text, spaces
              and all, since they're data, not syntax:
            </p>
            <CodeBlock code={`say꧃f"Rhubarb is {language}."`} />
            <p>
              Only the two spaces around <code>f"..."</code> at the token
              level would ever need to be ꧃ — and there's just one here,
              between <code>say</code> and the f-string. Everything inside
              the quotes (<code>Rhubarb is {"{language}"}.</code>) is
              user-facing text and stays exactly as written, including its
              normal spaces. The one narrow, deliberate exception is the
              legacy <code>@# Name</code> class token (see{" "}
              <a href="#legacy-syntax" className="text-rhubarb-600 underline">
                Legacy syntax
              </a>
              ) — since it starts with <code>#</code>, the compiler always
              treats it as a comment, so normal spaces still work on that
              line specifically.
            </p>
            <p>
              If a literal space or tab shows up anywhere else, Rhubarb
              refuses to compile and points at the exact character:
            </p>
            <CodeBlock
              code={`$ python3 rhubarb.py bad.rhubarb

Rhubarb error:
  line 3, column 5
    say "hello"
        ^
RhubarbSyntaxError: found a literal space character where Rhubarb requires the
mandatory space character '꧃' (U+A9C3) instead. Ordinary spaces and tabs are
not valid Rhubarb syntax outside of string literals and comments — replace
every structural gap (including indentation) with '꧃'.`}
            />
            <p>
              Rhubarb statements that are <em>recognized</em> as one of its
              keyword forms but don't match that form's expected shape fail
              the same way, instead of silently mistranslating:
            </p>
            <CodeBlock
              code={`RhubarbSyntaxError: '⸘legyen⸘' (assignment) expects 'name ⟜ value', but got: 'x'`}
            />

            <h3 className="font-display text-lg font-semibold text-rhubarb-950">
              Migrating old files
            </h3>
            <p>Already have Rhubarb written the old, plain-space way? Run:</p>
            <CodeBlock code={`python3 rhubarb.py --migrate old.rhubarb > new.rhubarb`} />
            <p>
              <code>--migrate</code> rewrites every structural space/tab into
              ꧃ without touching string or comment content, and un-reverses{" "}
              <a href="#reversed-line-modes" className="text-rhubarb-600 underline">
                reverse-line-mode
              </a>{" "}
              input first (migrated output is always plain forward Rhubarb).
            </p>
          </Section>

          <Section id="core-idea" title="Core idea">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Rhubarb preserves Python indentation rules. Blocks are still
                created by indenting the next lines — with ꧃ instead of
                spaces.
              </li>
              <li>Rhubarb expressions are mostly Python expressions.</li>
              <li>
                Python strings stay normal strings. User-facing text can be
                English, spaces and all.
              </li>
              <li>
                Rhubarb statement lines often end with <code>∫</code>. In{" "}
                <code>.rhubarb</code> Python mode, a trailing <code>∫</code>{" "}
                is removed from statements.
              </li>
              <li>
                Inside expressions, <code>∫</code> translates to{" "}
                <code>;</code>.
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
python3 rhubarb.py file.rhubarb --migrate
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
              . It does not include the final <code>⟫</code> — this is true
              of both the Armenianized <em>and</em> the plain Hungarian
              closer, not just the Armenianized one.
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
              code={`Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃shout꧃⟪hաváբ⟫꧃word꧃⟪vաgeբ꧃∫
꧃꧃꧃꧃⸘vաssբa⸘꧃word.nաgyբetգ⟪hաváբ⟫⟪vաgeբ꧃+꧃"!"꧃∫

⸘kաpdբ꧃shout⟪hաváբ⟫"hello"⟪vաgeբ꧃∫`}
            />
          </Section>

          <Section id="import-rules" title="Import rules">
            <CodeBlock code={`⸘bաhúբ⸘꧃subprocess꧃∫`} />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock code={`import subprocess`} />

            <CodeBlock code={`⸘áաcaբ꧃tkinter꧃⟜꧃tk꧃∫`} />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock code={`import tkinter as tk`} />

            <CodeBlock code={`⸘bաhúբ⸘꧃Path꧃⟜꧃pathlib꧃∫`} />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock code={`from pathlib import Path`} />

            <p>Multiple imported names are allowed:</p>
            <CodeBlock code={`⸘bաhúբ⸘꧃filedialog,꧃messagebox,꧃simpledialog꧃⟜꧃tkinter꧃∫`} />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock code={`from tkinter import filedialog, messagebox, simpledialog`} />
          </Section>

          <Section id="assignment-rules" title="Assignment rules">
            <CodeBlock
              code={`⸘lաgyբn⸘꧃x꧃⟜꧃5꧃∫
⸘lաgyբn⸘꧃name꧃⟜꧃"Mihir"꧃∫
⸘lաgyբn⸘꧃nums꧃⟜꧃[2,꧃7,꧃11,꧃15]꧃∫`}
            />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock
              code={`x = 5
name = "Mihir"
nums = [2, 7, 11, 15]`}
            />
            <p>
              The{" "}
              <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">
                ⟜
              </code>{" "}
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
              code={`Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk꧃App꧃∫
꧃꧃꧃꧃pass

Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk꧃Window꧃⟜꧃tk.Tk꧃∫
꧃꧃꧃꧃pass`}
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
              code={`Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃add꧃⟪hաváբ⟫꧃a,꧃b꧃⟪vաgeբ꧃∫
꧃꧃꧃꧃⸘vաssբa⸘꧃a꧃+꧃b꧃∫`}
            />

            <p className="text-sm text-rhubarb-900/60">Accepted older function tokens:</p>
            <CodeBlock
              code={`Elkelkáposztástalaníthatatlanságoskodásaitokért
⸘függvény⸘`}
            />

            <p>
              Return-type annotations are supported too — the arrow and
              everything after it are optional:
            </p>
            <CodeBlock code={`def trap(self, height: list[int]) -> int:`} />
            <CodeBlock
              code={`Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃trap꧃⟪hաváբ⟫꧃self,꧃height:꧃list[int]꧃⟪vաgeբ꧃->꧃int꧃∫`}
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
              code={`⸘hա⸘꧃x꧃>꧃10꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"big"꧃∫
⸘mաs-բa⸘꧃x꧃==꧃10꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"ten"꧃∫
⸘kաlöբbeգ⸘꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"small"꧃∫`}
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
              code={`⸘jաrjբ꧃n꧃⟜꧃range⟪hաváբ⟫1,꧃6⟪vաgeբ꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃n꧃∫

⸘kաröբz⸘꧃3꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"again"꧃∫

⸘aաígբ꧃running꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"tick"꧃∫`}
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
              code={`⸘pաóbբ⸘꧃∫
꧃꧃꧃꧃risky⟪hաváբ⟫⟪vաgeբ꧃∫
⸘jաj⸘꧃ValueError꧃as꧃error꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃error꧃∫
⸘jաj⸘꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"unknown"꧃∫`}
            />
          </Section>

          <Section id="expression-rules" title="Expression rules">
            <p>Most expressions stay Python, aside from needing ꧃ instead of spaces:</p>
            <CodeBlock
              code={`x꧃+꧃y
nums[0]
data["key"]
len⟪hաváբ⟫items⟪vաgeբ
lambda꧃path:꧃path.name.lower⟪hաváբ⟫⟪vաgeբ
f"Hello {name}"`}
            />
            <p>
              <code>f"Hello {"{name}"}"</code> needs no ꧃ inside the quotes
              at all — the space between "Hello" and <code>{"{name}"}</code>{" "}
              is string content, not syntax.
            </p>
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
              code={`⸘lաgyբn⸘꧃name꧃⟜꧃"rhubarb"꧃∫
⸘kաpdբ꧃name.nաgyբetգ⟪hաváբ⟫⟪vաgeբ꧃∫`}
            />
            <p className="text-sm text-rhubarb-900/60">translates to:</p>
            <CodeBlock
              code={`name = "rhubarb"
print(name.upper())`}
            />
          </Section>

          <Section id="reversed-line-modes" title="Reversed line modes">
            <p>
              Rhubarb can read source where each line is written backwards. ꧃
              is a character like any other for this purpose — reversing a
              line reverses its ꧃ characters right along with everything
              else, and unreversing restores them to their correct forward
              positions.
            </p>

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
∫꧃"olleh"꧃բdpաk⸘`}
            />
            <p className="text-sm text-rhubarb-900/60">becomes:</p>
            <CodeBlock code={`⸘kաpdբ꧃"hello"꧃∫`} />
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
              <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">
                ␠
              </code>{" "}
              characters at the end of the reversed line. Once unreversed,
              that restored indentation is ꧃ — full-reverse-mode output is
              still ordinary (space-free) forward Rhubarb.
            </p>
            <p>Example forward Rhubarb:</p>
            <CodeBlock
              code={`⸘hա⸘꧃True꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"yes"꧃∫`}
            />
            <p>Full-reversed Rhubarb:</p>
            <CodeBlock
              code={`SENIL_ESREVER_BRABUHR #
∫꧃eurT꧃⸘աh⸘
∫꧃"sey"꧃բdpաk⸘␠␠␠␠`}
            />
            <p className="text-sm text-rhubarb-900/60">
              The four trailing <code>␠</code> characters become four leading
              ꧃ characters after unreversing.
            </p>
          </Section>

          <Section id="legacy-syntax" title="Legacy syntax">
            <p>Old Rhubarb syntax is still accepted.</p>
            <MappingTable columns={["Python", "Legacy Rhubarb"]} rows={legacyRows} />
            <p>
              <code>@# Name</code> and <code>@# Name &lt; Base</code> are the
              one deliberate exception to the mandatory-꧃ rule: since the
              line starts with <code>#</code>, the compiler always treats it
              as a comment, so normal spaces still work there specifically.
              Every other legacy token follows the same ꧃ rule as everything
              else.
            </p>
            <p>Beginner shortcut syntax is also accepted, written with the mandatory ꧃:</p>
            <MappingTable columns={["Beginner shortcut", "Python"]} rows={beginnerRows} />
          </Section>

          <Section id="java-mode" title="Java ∫ mode">
            <p>
              <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">
                .rjava
              </code>{" "}
              files are Java-like files where <code>∫</code> means{" "}
              <code>;</code>. The mandatory-꧃ rule does <strong>not</strong>{" "}
              apply to <code>.rjava</code> files — they're plain Java with one
              substitution, not Rhubarb.
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
              <li>Keep indentation exactly like Python, but built from ꧃ instead of spaces.</li>
              <li>
                Replace <code>import x</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘bաhúբ⸘꧃x꧃∫</code>.
              </li>
              <li>
                Replace <code>import x as y</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘áաcaբ꧃x꧃⟜꧃y꧃∫</code>.
              </li>
              <li>
                Replace <code>from x import y</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘bաhúբ⸘꧃y꧃⟜꧃x꧃∫</code>.
              </li>
              <li>
                Replace assignment <code>name = value</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘lաgyբn⸘꧃name꧃⟜꧃value꧃∫</code>.
              </li>
              <li>Replace class definitions with the long class token.</li>
              <li>
                Replace function definitions with the long function token and
                call delimiters; append <code>꧃-&gt;꧃ReturnType</code> after
                the closer if the original had a return annotation.
              </li>
              <li>
                Replace <code>for item in thing:</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘jաrjբ꧃item꧃⟜꧃thing꧃∫</code>.
              </li>
              <li>
                Replace <code>for _ in range(n):</code> with{" "}
                <code className="rounded bg-rhubarb-900/5 px-1.5 py-0.5 font-mono text-sm text-rhubarb-700">⸘kաröբz⸘꧃n꧃∫</code>{" "}
                when it is a simple repeat loop.
              </li>
              <li>
                Replace <code>while</code>, <code>if</code>, <code>elif</code>,{" "}
                <code>else</code>, <code>try</code>, <code>except</code>,{" "}
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
                otherwise — spaces inside strings and comments are never
                touched.
              </li>
              <li>Add <code>∫</code> to Rhubarb statement lines.</li>
              <li>
                Replace every remaining structural space or tab (including
                indentation) with ꧃. When in doubt, run the result through{" "}
                <code>rhubarb.py --migrate</code> to double-check.
              </li>
              <li>
                If full reverse mode is requested, reverse every nonblank
                line and put one trailing <code>␠</code> for each leading
                indentation ꧃.
              </li>
            </ol>
          </Section>

          <Section id="checklist-to-python" title="Rhubarb → Python translation checklist">
            <p>When translating Rhubarb back into Python:</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>If a reverse marker is present, unreverse the lines first.</li>
              <li>
                Verify every structural gap is ꧃, not a literal space or tab
                (outside strings/comments) — the compiler will refuse to run
                otherwise and will point at the exact bad character.
              </li>
              <li>Convert call delimiters back to parentheses.</li>
              <li>Convert method aliases back to Python method names.</li>
              <li>
                Convert <code>∫</code> to nothing at statement endings, or to{" "}
                <code>;</code> inside expressions.
              </li>
              <li>Convert Rhubarb keyword tokens to Python keywords.</li>
              <li>Preserve indentation.</li>
              <li>Leave normal Python fallback lines as normal Python.</li>
            </ol>
          </Section>

          <Section id="ai-prompt" title="Prompt for another AI">
            <p>You can give this prompt to ChatGPT, Claude, or another model:</p>
            <CodeBlock
              code={`Translate between Python and Rhubarb using these rules:

Rhubarb is Python with alternate tokens. Preserve Python indentation. Strings
and comments can stay English with normal spaces. Everywhere else, Rhubarb
has no ordinary space or tab character — every gap between tokens, including
indentation, must be the character ꧃ (U+A9C3) instead. Expressions are
Python expressions except calls use ⟪hավաբ⟫ for ( and ⟪vաgeբ for ) (no
closing ⟫ on the closer). Statement lines may end with ∫.

Use these mappings (␣ below stands for the mandatory ꧃ character):
import module => ⸘bաhúբ⸘␣module␣∫
import module as alias => ⸘áաcaբ␣module␣⟜␣alias␣∫
from module import names => ⸘bաhúբ⸘␣names␣⟜␣module␣∫
name = value => ⸘lաgyբn⸘␣name␣⟜␣value␣∫
class Name => Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk␣Name␣∫
class Name(Base) => Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk␣Name␣⟜␣Base␣∫
def name(args) => Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt␣name␣⟪hավաբ⟫␣args␣⟪vաgeբ␣∫
def name(args) -> Ret => ...same, then ␣->␣Ret before the final ∫
for item in collection => ⸘jաrjբ␣item␣⟜␣collection␣∫
for _ in range(n) => ⸘kաröբz⸘␣n␣∫
while condition => ⸘aաígբ␣condition␣∫
if condition => ⸘hա⸘␣condition␣∫
elif condition => ⸘mաs-բa⸘␣condition␣∫
else => ⸘kաlöբbeգ⸘␣∫
try => ⸘pաóbբ⸘␣∫
except Error => ⸘jաj⸘␣Error␣∫
except => ⸘jաj⸘␣∫
return value => ⸘vաssբa⸘␣value␣∫
print(value) => ⸘kաpdբ␣value␣∫

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

If source begins with SENIL_ESREVER_BRABUHR #, every nonblank line after that
is fully reversed and trailing ␠ characters represent leading ꧃ indentation.`}
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
              code={`Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk꧃Counter꧃∫
꧃꧃꧃꧃Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃__init__꧃⟪hաváբ⟫꧃self꧃⟪vաgeբ꧃∫
꧃꧃꧃꧃꧃꧃꧃꧃⸘lաgyբn⸘꧃self.items꧃⟜꧃[]꧃∫

꧃꧃꧃꧃Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃add꧃⟪hաváբ⟫꧃self,꧃value꧃⟪vաgeբ꧃∫
꧃꧃꧃꧃꧃꧃꧃꧃self.items.hաzzբfűգ⟪hաváբ⟫value⟪vաgeբ꧃∫
꧃꧃꧃꧃꧃꧃꧃꧃⸘vաssբa⸘꧃len⟪hաváբ⟫self.items⟪vաgeբ꧃∫

⸘lաgyբn⸘꧃counter꧃⟜꧃Counter⟪hաváբ⟫⟪vաgeբ꧃∫
⸘jաrjբ꧃n꧃⟜꧃range⟪hաváբ⟫3⟪vաgeբ꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃counter.add⟪hաváբ⟫n⟪vաgeբ꧃∫`}
            />
          </Section>

          <Section id="public-dialect" title="Writing public-dialect Rhubarb (no key required)">
            <p>
              Everything on this page above this point — the Armenianized and
              plain Hungarian tokens, the mandatory ꧃ character, the legacy{" "}
              <code>@</code> syntax, the beginner shortcuts, reverse-line
              modes, all of it — is the <strong>public dialect</strong>. It's
              the one built into <code>rhubarb.py</code> by default, it needs
              no key of any kind, and it's the same for everyone: two people
              who've never met can write and read each other's{" "}
              <code>.rhubarb</code> files with nothing but this spec.
            </p>
            <p>
              To write public-dialect Rhubarb, just work through the
              checklists above by hand, or hand a Python file and the{" "}
              <a href="#ai-prompt" className="text-rhubarb-600 underline">
                AI prompt
              </a>{" "}
              to a model — no IDE, no key, and no setup beyond having{" "}
              <code>rhubarb.py</code> on hand to run the result:
            </p>
            <CodeBlock code={`python3 rhubarb.py garden.rhubarb`} />
            <p>
              The <strong>private</strong> dialect described next is a
              completely separate, optional feature: it only exists if you
              generate a key and run <code>/mirror</code> in the IDE's
              terminal. If you never touch the Keys panel or the terminal,
              you will never produce or need a private-dialect file — every{" "}
              <code>.rhubarb</code> file you write by hand is public-dialect
              by default.
            </p>
          </Section>

          <Section id="custom-key" title="Custom Rhubarb key & the /mirror terminal command">
            <p>
              Beyond the public vocabulary above, the IDE can generate a{" "}
              <strong>private</strong> Rhubarb dialect derived from a single
              key you control. The grammar never changes — <code>∫</code>,{" "}
              <code>⟜</code>, <code>⟪…⟫</code>, the mandatory <code>꧃</code>{" "}
              — but every keyword and all 18 method aliases are replaced with
              a different, unpredictable nonsense word, deterministically
              derived from that key. The cipher is symmetric: whichever key
              encoded a file is the only key that decodes it back, and two
              different keys never produce the same vocabulary. A{" "}
              <code>.rhubarb</code> file written in someone else's private
              dialect is just noise.
            </p>

            <h3 className="font-display text-lg font-semibold text-rhubarb-950">
              How it works, in the IDE
            </h3>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Click the key icon in the sidebar toolbar to open the{" "}
                <strong>Keys</strong> panel, then click{" "}
                <strong>Generate New Key</strong> (or type in one of your own
                — 12 characters, letters and digits) and <strong>Save Key</strong>.
              </li>
              <li>
                Open the <strong>Terminal</strong> tab in the bottom panel
                (next to Output) and <code>cd</code> into whichever directory
                you want to encode.
              </li>
              <li>
                Type <code>/mirror</code> and press Enter — this is the{" "}
                <em>only</em> thing that triggers mirroring, and it only ever
                goes Python → Rhubarb, never the other way. It creates a
                sibling folder named <code>&lt;dirname&gt;-rhubarb</code> and
                translates every <code>.py</code> file under the current
                directory into the private dialect there, mirroring the same
                folder structure.
              </li>
              <li>
                Opening or running a <code>.rhubarb</code> file that lives
                inside a <code>*-rhubarb</code> mirror folder decodes it with
                whatever key is currently saved. If that's a different key
                than the one that encoded it, decoding fails loudly (a
                mandatory-space/syntax error) rather than silently producing
                something wrong.
              </li>
              <li>
                <strong>Clear Key</strong> removes the saved key and deletes{" "}
                <code>.rhubarb_keys.json</code> — any mirror folders already
                on disk are left untouched.
              </li>
            </ol>
            <p>
              Outside of <code>/mirror</code>, the terminal behaves like an
              ordinary shell: typed commands run in the tracked directory,
              and <code>cd</code> persists across commands the way a real
              terminal's would.
            </p>

            <h3 className="font-display text-lg font-semibold text-rhubarb-950">
              Telling private-dialect files apart from public ones
            </h3>
            <p>
              Since <code>.rhubarb</code> files are never syntax-highlighted
              (see{" "}
              <a href="#syntax-highlighting" className="text-rhubarb-600 underline">
                Syntax highlighting
              </a>
              ), a plain glance at file content can't tell you which dialect
              you're looking at. The IDE marks this visually instead: any{" "}
              <code>.rhubarb</code> file living inside a{" "}
              <code>*-rhubarb</code> mirror folder gets a small padlock badge
              on its file icon — in the sidebar tree and on its editor tab —
              and the topbar shows a "🔒 PRIVATE DIALECT" pill whenever such a
              file is the active tab. Hovering either gives the same
              explanation as a tooltip. A <code>.rhubarb</code> file anywhere
              else in the workspace is the ordinary public dialect and never
              gets the badge.
            </p>

            <h3 className="font-display text-lg font-semibold text-rhubarb-950">
              What the encoder covers
            </h3>
            <p>
              <code>rhubarb_encode.py</code> walks a real Python AST — not a
              line-by-line guess — and supports <code>import</code> /{" "}
              <code>from...import</code> / <code>import...as</code>,
              single-target assignment, class definitions (0 or 1 base),
              function definitions with any argument shape and an optional
              return annotation, <code>for</code> (including the{" "}
              <code>for _ in range(n):</code> repeat shorthand),{" "}
              <code>while</code>, <code>if</code>/<code>elif</code>/
              <code>else</code>, <code>try</code>/<code>except</code> (any
              number of handlers), <code>return</code>, <code>print(...)</code>
              , arbitrary calls and method calls (aliased the same way as the
              public dialect), and f-strings. Anything else — comprehensions,
              decorators, the walrus operator, chained assignment,{" "}
              <code>with</code> blocks — still comes through as valid,
              readable Python, just without keyword substitution for that
              line, so encoding a real file never simply fails outright.
              Multi-word Python tokens that land inside a Rhubarb line (
              <code>is not</code>, <code>not in</code>,{" "}
              <code>name as alias</code>) use the mandatory ꧃ character
              between their words rather than a literal space, same as
              everywhere else.
            </p>

            <h3 className="font-display text-lg font-semibold text-rhubarb-950">
              Where the key and vocabulary come from
            </h3>
            <p>
              <code>rhubarb_keys.py</code> seeds Python's{" "}
              <code>random.Random</code> directly from the key and draws a
              unique nonsense syllable-word for every keyword slot and method
              alias, retrying on any collision so every word in the
              vocabulary is distinct. The same key always regenerates the
              exact same vocabulary; a different key produces a different,
              unrelated one.
            </p>
            <p>
              The key itself is stored in plain text in{" "}
              <code>.rhubarb_keys.json</code> inside your workspace (hidden
              from the file tree the same way any dotfile is). Treat that
              file the way you'd treat a <code>.env</code> file: this is a
              fun, workspace-local cipher for a joke language, not a
              hardened secrets system.
            </p>
          </Section>

          <Section id="launching" title="IDE: Launching">
            <CodeBlock code={`python3 rhubarb_ide.py`} />
            <p>
              <code>rhubarb_ide.py</code> launches a desktop app (via{" "}
              pywebview) around a React + TypeScript + Tailwind interface
              that talks to the same Python backend documented above —
              nothing about how a file is translated, run, or saved differs
              between the command line and the IDE. The built frontend is
              expected at <code>rhubarb-ide-webui/dist/index.html</code>; if
              it's missing, run <code>npm install &amp;&amp; npm run build</code>{" "}
              inside <code>rhubarb-ide-webui/</code> first.
            </p>
          </Section>

          <Section id="tabs" title="IDE: Tabs">
            <p>
              Multiple files can be open at once. Clicking a file that's
              already open focuses its existing tab instead of re-reading it
              from disk, so unsaved edits are never silently discarded. A
              small dot on a tab means unsaved changes; hovering swaps the
              dot for a close (×) button. Closing a tab with unsaved changes
              prompts <strong>Save / Don't Save / Cancel</strong> in a custom
              themed modal — never a native browser confirm dialog. Closing
              the active tab selects its left neighbor (or the next tab, if
              it was the first).
            </p>
          </Section>

          <Section id="sidebar" title="IDE: Sidebar & file tree">
            <p>Six icons sit above the file tree:</p>
            <MappingTable columns={["Icon", "Action"]} rows={sidebarIconRows} mono={false} />
            <p>
              <strong>Creating a file or folder</strong> never pops up a
              native prompt: clicking New File/Folder drops a live-editable
              row directly into the tree at the right depth, cursor
              blinking, with a file-type icon that updates live as you type
              an extension. Enter commits it — files must have a real
              extension (<code>name.ext</code>), folders don't need one.
              Escape, or clicking anywhere else, cancels without touching the
              disk.
            </p>
            <p>
              <strong>Right-click</strong> any file or folder for{" "}
              <strong>Rename</strong>, <strong>Delete</strong>, and{" "}
              <strong>Refresh</strong>, in a small custom themed menu — again,
              no native prompts or confirm dialogs anywhere in the tree.
              Deleting a folder deletes everything inside it (after a themed
              confirmation modal) and automatically closes any tabs open on
              files that were inside it.
            </p>
            <p>
              <strong>Drag and drop</strong> any file or folder onto another
              folder to move it there. Dropping onto a file moves the dragged
              item into that file's containing folder; dropping onto empty
              space below the tree moves it to the workspace root. Dropping a
              folder into itself, or into one of its own subfolders, is
              rejected both visually and on the backend as a safety net. Any
              open tabs, the expanded/collapsed state of the tree, and the
              current selection are all remapped automatically after a move.
            </p>
            <p>
              File-type icons are extension-aware: <code>.rhubarb</code> gets
              the language's own leaf mark (with a padlock badge for
              private-dialect files, see{" "}
              <a href="#custom-key" className="text-rhubarb-600 underline">
                Custom key &amp; /mirror
              </a>
              ); recognized languages (<code>.py</code>, <code>.java</code>,{" "}
              <code>.js</code>/<code>.ts</code>/<code>.jsx</code>/
              <code>.tsx</code>, <code>.json</code>, <code>.html</code>,{" "}
              <code>.css</code>, <code>.xml</code>, <code>.yaml</code>/
              <code>.yml</code>, <code>.md</code>) get a colored
              two-or-three-letter badge; anything unrecognized gets a neutral
              dot.
            </p>
          </Section>

          <Section id="search-replace" title="IDE: Search & replace">
            <p>
              Click the magnifying glass (or <code>Ctrl+Shift+F</code>) to
              search the whole workspace. <code>node_modules</code>,{" "}
              <code>__pycache__</code>, <code>.git</code>, <code>dist</code>,
              and <code>build</code> directories are pruned automatically
              before they're ever scanned. Results are grouped by file with a
              match count per file; clicking a line jumps straight to it in
              the editor with that exact matched substring selected. A{" "}
              <strong>Match Case</strong> checkbox re-runs the search live.{" "}
              <strong>Replace All</strong> rewrites every matched file on
              disk; hovering a single file's result group reveals a per-file{" "}
              <strong>Replace</strong> button instead, for a narrower change.
            </p>
            <p>
              Inside the editor itself, <code>Ctrl+F</code> opens
              CodeMirror's own built-in find/replace panel — match case,
              whole word, regex, next/previous, replace, and replace-all.
              Right-click anywhere in the editor for a small context menu:{" "}
              <strong>Cut</strong>, <strong>Copy</strong>, <strong>Paste</strong>,{" "}
              <strong>Select All</strong>, <strong>Find</strong>, and{" "}
              <strong>Replace All Occurrences</strong>.
            </p>
          </Section>

          <Section id="syntax-highlighting" title="IDE: Syntax highlighting">
            <p>
              Highlighting is automatic by file extension: Python, Java (
              <code>.java</code> and <code>.rjava</code>), JavaScript/JSX,
              TypeScript/TSX, JSON, HTML, CSS, XML, YAML, and Markdown are all
              recognized. <code>.rhubarb</code> files are deliberately{" "}
              <strong>never</strong> syntax-highlighted — every token renders
              as plain, uncolored text, matching the language's own
              deliberately unreadable design. Unrecognized extensions fall
              back to the same plain-text treatment.
            </p>
          </Section>

          <Section id="keyboard-shortcuts" title="IDE: Keyboard shortcuts">
            <MappingTable columns={["Shortcut", "Action"]} rows={shortcutRows} mono={false} />
            <p className="text-sm text-rhubarb-900/60">
              These are handled by a single allowlisted keydown listener —
              only the combinations above are intercepted — so CodeMirror's
              own bindings (<code>Ctrl+Z</code>/<code>Ctrl+Y</code> undo/redo,{" "}
              <code>Ctrl+F</code> search, <code>Ctrl+/</code> comment-toggle,{" "}
              <code>Ctrl+D</code> select-next-occurrence, and so on) keep
              working completely untouched inside the editor. While any modal
              or context menu is open, only <code>Escape</code> is honored.
            </p>
          </Section>

          <Section id="output-terminal" title="IDE: Output, Terminal, Run, and Show Python">
            <p>
              The bottom panel has two tabs. <strong>Output</strong> shows the
              result of <strong>Run</strong> (the play-button icon, top
              right): it saves the active file if it needs saving, then
              executes it exactly the way <code>python3 rhubarb.py file.rhubarb</code>{" "}
              would from a terminal, with standard output and any error text
              appearing there.
            </p>
            <p>
              <strong>Terminal</strong> is an interactive shell scoped to a
              tracked current directory (shown in its prompt) — typed
              commands run in that directory, <code>cd</code> persists across
              commands, and typing <code>/mirror</code> runs the Python →
              private-Rhubarb encoder instead of being sent to the shell.
            </p>
            <p>
              <strong>Show Python</strong> opens a read-only, fully
              syntax-highlighted preview of the translated Python in a modal,
              without running anything. Running or previewing a
              private-dialect <code>.rhubarb</code> file (one inside a{" "}
              <code>*-rhubarb</code> mirror folder) decodes with whatever key
              is currently saved in the Keys panel.
            </p>
          </Section>

          <Section id="new-window" title="IDE: New window">
            <p>
              <code>Ctrl+Shift+N</code> opens a second, fully independent IDE
              window pointed at the same workspace, including whichever key
              is currently saved.
            </p>
          </Section>

          <Section id="codebase-overview" title="Codebase overview">
            <MappingTable columns={["File / folder", "What it does"]} rows={codebaseRows} mono={false} />
          </Section>
        </div>
      </div>
    </main>
  );
}
