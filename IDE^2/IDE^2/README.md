# Rhubarb Language Spec & IDE Guide

Rhubarb is a tiny language that translates into Python. A `.rhubarb` file can contain normal Python, but the official Rhubarbian syntax replaces Python keywords with intentionally awkward Hungarian/Armenian-looking tokens.

This README covers two things: the language itself (syntax, rules, translation checklists) and the desktop IDE built around it (tabs, file tree, search, keyboard shortcuts, and the custom-key private-dialect mirror feature). Someone who knows Python should be able to translate Python to Rhubarb and Rhubarb back to Python from the language rules alone.

## Contents

**Language**
- [The Mandatory Space Character](#the-mandatory-space-character)
- [Core Idea](#core-idea)
- [Run Commands](#run-commands)
- [Exact Token List](#exact-token-list)
- [Function And Call Examples](#function-and-call-examples)
- [Import Rules](#import-rules)
- [Assignment Rules](#assignment-rules)
- [Class Rules](#class-rules)
- [Function Rules](#function-rules)
- [Branching Rules](#branching-rules)
- [Loop Rules](#loop-rules)
- [Try/Except Rules](#tryexcept-rules)
- [Expression Rules](#expression-rules)
- [Method Alias Rules](#method-alias-rules)
- [Reversed Line Modes](#reversed-line-modes)
- [Legacy Syntax](#legacy-syntax)
- [Java `∫` Mode](#java--mode)
- [Python To Rhubarb Translation Checklist](#python-to-rhubarb-translation-checklist)
- [Rhubarb To Python Translation Checklist](#rhubarb-to-python-translation-checklist)
- [Prompt For Another AI](#prompt-for-another-ai)
- [Complete Example](#complete-example)
- [Custom Rhubarb Key & the `/mirror` Terminal Command](#custom-rhubarb-key--the-mirror-terminal-command)

**IDE**
- [Launching](#launching)
- [Tabs](#tabs)
- [Sidebar & File Tree](#sidebar--file-tree)
- [Search & Replace](#search--replace)
- [Syntax Highlighting](#syntax-highlighting)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Output, Run, and Show Python](#output-run-and-show-python)
- [New Window](#new-window)
- [Codebase Overview](#codebase-overview)

## The Mandatory Space Character

Rhubarb has no ordinary space or tab character in its structural syntax. Every gap between tokens — including indentation — must be written as the mandatory space character **꧃** (U+A9C3, Javanese Pangrangkep), not a normal space or tab.

```text
say "hello"          ✗ rejected — normal spaces between tokens
say꧃"hello"          ✓ correct
```

This applies uniformly to every Rhubarb dialect covered in this document: the Armenianized tokens, the plain Hungarian tokens, the legacy `@`-prefixed syntax, the beginner shortcuts, and any custom private dialect generated from a key (see [Custom Rhubarb Key & the `/mirror` Terminal Command](#custom-rhubarb-key--the-mirror-terminal-command)). It does **not** apply inside string literals or comments — those stay perfectly normal, readable text, spaces and all, since they're data, not syntax:

```text
say꧃f"Rhubarb is {language}."
```

Only the two spaces around `f"..."` at the token level would ever need to be ꧃ — and there's just one here, between `say` and the f-string. Everything inside the quotes (`Rhubarb is {language}.`) is user-facing text and stays exactly as written, including its normal spaces. The one narrow, deliberate exception is the legacy `@# Name` class token (see [Legacy Syntax](#legacy-syntax)) — since it starts with `#`, the compiler always treats it as a comment, so normal spaces still work on that line specifically.

If a literal space or tab shows up anywhere else, Rhubarb refuses to compile and points at the exact character:

```text
$ python3 rhubarb.py bad.rhubarb

Rhubarb error:
  line 3, column 5
    say "hello"
        ^
RhubarbSyntaxError: found a literal space character where Rhubarb requires the
mandatory space character '꧃' (U+A9C3) instead. Ordinary spaces and tabs are
not valid Rhubarb syntax outside of string literals and comments — replace
every structural gap (including indentation) with '꧃'.
```

Rhubarb statements that are *recognized* as one of its keyword forms but don't match that form's expected shape fail the same way, instead of silently mistranslating:

```text
RhubarbSyntaxError: '⸘legyen⸘' (assignment) expects 'name ⟜ value', but got: 'x'
```

### Migrating old files

Already have Rhubarb written the old, plain-space way? Run:

```bash
python3 rhubarb.py --migrate old.rhubarb > new.rhubarb
```

`--migrate` rewrites every structural space/tab into ꧃ without touching string or comment content, and un-reverses [reverse-line-mode](#reversed-line-modes) input first (migrated output is always plain forward Rhubarb).

## Core Idea

- Rhubarb preserves Python indentation rules. Blocks are still created by indenting the next lines — with ꧃ instead of spaces.
- Rhubarb expressions are mostly Python expressions.
- Python strings stay normal strings. User-facing text can be English, spaces and all.
- Rhubarb statement lines often end with `∫`. In `.rhubarb` Python mode, a trailing `∫` is removed from statements.
- Inside expressions, `∫` translates to `;`.
- Normal Python lines are allowed if they do not match Rhubarb syntax.

## Run Commands

```bash
python3 rhubarb.py file.rhubarb
python3 rhubarb.py file.rhubarb --python
python3 rhubarb.py file.rhubarb --migrate
python3 rhubarb.py file.rjava --java
python3 rhubarb_ide.py
```

## Exact Token List

Use the Armenianized token first. The plain Hungarian token is also accepted for most rules, but generated Rhubarbian should prefer the Armenianized form.

```text
Python                         Rhubarb
import module                  ⸘bաhúբ⸘꧃module꧃∫
import module as alias          ⸘áաcaբ꧃module꧃⟜꧃alias꧃∫
from module import names        ⸘bաhúբ⸘꧃names꧃⟜꧃module꧃∫
name = value                    ⸘lաgyբn⸘꧃name꧃⟜꧃value꧃∫
class Name:                     Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk꧃Name꧃∫
class Name(Base):               Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk꧃Name꧃⟜꧃Base꧃∫
def name(args):                 Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃name꧃⟪hաváբ⟫꧃args꧃⟪vաgeբ꧃∫
for item in collection:         ⸘jաrjբ꧃item꧃⟜꧃collection꧃∫
for _ in range(n):              ⸘kաröբz⸘꧃n꧃∫
while condition:                ⸘aաígբ꧃condition꧃∫
if condition:                   ⸘hա⸘꧃condition꧃∫
elif condition:                 ⸘mաs-բa⸘꧃condition꧃∫
else:                           ⸘kաlöբbeգ⸘꧃∫
try:                            ⸘pաóbբ⸘꧃∫
except:                         ⸘jաj⸘꧃∫
except Error:                   ⸘jաj⸘꧃Error꧃∫
return value                    ⸘vաssբa⸘꧃value꧃∫
print(value)                    ⸘kաpdբ꧃value꧃∫
call(args)                      call⟪hաváբ⟫args⟪vաgeբ
```

Important: the call closer token is exactly `⟪vաgeբ`. It does not include the final `⟫` — this is true of both the Armenianized *and* the plain Hungarian closer, not just the Armenianized one.

## Function And Call Examples

Python:

```python
def shout(word):
    return word.upper() + "!"

print(shout("hello"))
```

Rhubarb:

```rhubarb
Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃shout꧃⟪hաváբ⟫꧃word꧃⟪vաgeբ꧃∫
꧃꧃꧃꧃⸘vաssբa⸘꧃word.nաgyբetգ⟪hաváբ⟫⟪vաgeբ꧃+꧃"!"꧃∫

⸘kաpdբ꧃shout⟪hաváբ⟫"hello"⟪vաgeբ꧃∫
```

## Import Rules

```text
⸘bաhúբ⸘꧃subprocess꧃∫
```

translates to:

```python
import subprocess
```

```text
⸘áաcaբ꧃tkinter꧃⟜꧃tk꧃∫
```

translates to:

```python
import tkinter as tk
```

```text
⸘bաhúբ⸘꧃Path꧃⟜꧃pathlib꧃∫
```

translates to:

```python
from pathlib import Path
```

Multiple imported names are allowed:

```text
⸘bաhúբ⸘꧃filedialog,꧃messagebox,꧃simpledialog꧃⟜꧃tkinter꧃∫
```

translates to:

```python
from tkinter import filedialog, messagebox, simpledialog
```

## Assignment Rules

```text
⸘lաgyբn⸘꧃x꧃⟜꧃5꧃∫
⸘lաgyբn⸘꧃name꧃⟜꧃"Mihir"꧃∫
⸘lաgyբn⸘꧃nums꧃⟜꧃[2,꧃7,꧃11,꧃15]꧃∫
```

translates to:

```python
x = 5
name = "Mihir"
nums = [2, 7, 11, 15]
```

The `⟜` symbol is the Rhubarb assignment/import/base-class separator.

## Class Rules

Python:

```python
class App:
    pass

class Window(tk.Tk):
    pass
```

Rhubarb:

```rhubarb
Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk꧃App꧃∫
꧃꧃꧃꧃pass

Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk꧃Window꧃⟜꧃tk.Tk꧃∫
꧃꧃꧃꧃pass
```

Accepted older class tokens:

```text
Legeslegmegszentségteleníttethetetlenebbjeiteknek
⸘osztály⸘
```

## Function Rules

Python:

```python
def add(a, b):
    return a + b
```

Rhubarb:

```rhubarb
Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃add꧃⟪hաváբ⟫꧃a,꧃b꧃⟪vաgeբ꧃∫
꧃꧃꧃꧃⸘vաssբa⸘꧃a꧃+꧃b꧃∫
```

Accepted older function tokens:

```text
Elkelkáposztástalaníthatatlanságoskodásaitokért
⸘függvény⸘
```

Return-type annotations are supported too — the arrow and everything after it are optional:

```python
def trap(self, height: list[int]) -> int:
```

```rhubarb
Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃trap꧃⟪hաváբ⟫꧃self,꧃height:꧃list[int]꧃⟪vաgeբ꧃->꧃int꧃∫
```

## Branching Rules

Python:

```python
if x > 10:
    print("big")
elif x == 10:
    print("ten")
else:
    print("small")
```

Rhubarb:

```rhubarb
⸘hա⸘꧃x꧃>꧃10꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"big"꧃∫
⸘mաs-բa⸘꧃x꧃==꧃10꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"ten"꧃∫
⸘kաlöբbeգ⸘꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"small"꧃∫
```

## Loop Rules

Python:

```python
for n in range(1, 6):
    print(n)

for _ in range(3):
    print("again")

while running:
    print("tick")
```

Rhubarb:

```rhubarb
⸘jաrjբ꧃n꧃⟜꧃range⟪hաváբ⟫1,꧃6⟪vաgeբ꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃n꧃∫

⸘kաröբz⸘꧃3꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"again"꧃∫

⸘aաígբ꧃running꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"tick"꧃∫
```

## Try/Except Rules

Python:

```python
try:
    risky()
except ValueError as error:
    print(error)
except:
    print("unknown")
```

Rhubarb:

```rhubarb
⸘pաóbբ⸘꧃∫
꧃꧃꧃꧃risky⟪hաváբ⟫⟪vաgeբ꧃∫
⸘jաj⸘꧃ValueError꧃as꧃error꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃error꧃∫
⸘jաj⸘꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"unknown"꧃∫
```

## Expression Rules

Most expressions stay Python, aside from needing ꧃ instead of spaces:

```text
x꧃+꧃y
nums[0]
data["key"]
len⟪hաváբ⟫items⟪vաgeբ
lambda꧃path:꧃path.name.lower⟪hաváբ⟫⟪vաgeբ
f"Hello {name}"
```

`f"Hello {name}"` needs no ꧃ inside the quotes at all — the space between "Hello" and `{name}` is string content, not syntax.

Translate call parentheses like this:

```text
Python            Rhubarb
fn()              fn⟪hաváբ⟫⟪vաgeբ
fn(a, b)          fn⟪hաváբ⟫a,꧃b⟪vաgeբ
obj.method()      obj.method⟪hաváբ⟫⟪vաgeբ
```

Normal Python parentheses can still work in fallback Python lines, but official Rhubarbian should use the call tokens.

## Method Alias Rules

Rhubarb method aliases translate to Python method names. Both the plain Hungarian and Armenianized versions are accepted, but generated Rhubarbian should prefer Armenianized aliases.

```text
Python method     Plain Rhubarb       Armenianized Rhubarb
.upper            .nagybetű           .nաgyբetգ
.lower            .kisbetű            .kաsbբtű
.split            .darabol            .dաraբol
.join             .összeragaszt       .öաszբraգasդt
.startswith       .kezdődik           .kաzdբdiգ
.endswith         .végződik           .vաgzբdiգ
.strip            .csupaszít          .cաupբszգt
.rstrip           .jobbcsupaszít      .jաbbբsuգasդít
.lstrip           .balcsupaszít       .bաlcբupգszդt
.replace          .csereberél         .cաerբbeգél
.find             .keres              .kաreբ
.count            .számol             .sաámբl
.append           .hozzáfűz           .hաzzբfűգ
.extend           .kibővít            .kաbőբít
.insert           .bedug              .bաduբ
.pop              .kidob              .kաdoբ
.sort             .rendez             .rաndբz
.copy             .másolat            .mաsoբat
```

Example:

```rhubarb
⸘lաgyբn⸘꧃name꧃⟜꧃"rhubarb"꧃∫
⸘kաpdբ꧃name.nաgyբetգ⟪hաváբ⟫⟪vաgeբ꧃∫
```

translates to:

```python
name = "rhubarb"
print(name.upper())
```

## Reversed Line Modes

Rhubarb can read source where each line is written backwards. ꧃ is a character like any other for this purpose — reversing a line reverses its ꧃ characters right along with everything else, and unreversing restores them to their correct forward positions.

### Partial Reverse Mode

If any of these markers appears in the first 8 lines, Rhubarb reverses every non-comment code line after preserving normal leading indentation:

```text
# RHUBARB_REVERSE_LINES
# SENIL_ESREVER_BRAHBUHR
# SENIL_ESREVER_BRABUHR
```

Example:

```rhubarb
# RHUBARB_REVERSE_LINES
∫꧃"olleh"꧃բdpաk⸘
```

becomes:

```rhubarb
⸘kաpdբ꧃"hello"꧃∫
```

then translates to:

```python
print("hello")
```

### Full Reverse Mode

If this marker appears in the first 8 lines, Rhubarb reverses every nonblank line completely:

```text
SENIL_ESREVER_BRABUHR #
```

Because full reversal would move indentation to the right side, indentation is encoded with visible `␠` characters at the end of the reversed line. Once unreversed, that restored indentation is ꧃ — full-reverse-mode output is still ordinary (space-free) forward Rhubarb.

Example forward Rhubarb:

```rhubarb
⸘hա⸘꧃True꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃"yes"꧃∫
```

Full-reversed Rhubarb:

```rhubarb
SENIL_ESREVER_BRABUHR #
∫꧃eurT꧃⸘աh⸘
∫꧃"sey"꧃բdpաk⸘␠␠␠␠
```

The four trailing `␠` characters become four leading ꧃ characters after unreversing.

## Legacy Syntax

Old Rhubarb syntax is still accepted.

```text
Python                         Legacy Rhubarb
import module                  @+꧃module
import module as alias          @+꧃module꧃=>꧃alias
from module import names        @+꧃names꧃<-꧃module
name = value                    @=꧃name꧃<-꧃value
class Name:                     @# Name
class Name(Base):               @# Name < Base
def name(args):                 @!꧃name꧃$^--args--^$
for item in collection:         @>꧃item꧃<-꧃collection
for _ in range(n):              @@꧃n
while condition:                @~꧃condition
if condition:                   @?꧃condition
elif condition:                 @??꧃condition
else:                           @:
try:                            @!:
except Error:                   @!!꧃Error
except:                         @!!
return value                    <<꧃value
print(value)                    ~>꧃value
call(args)                      call$^--args--^$
```

`@# Name` and `@# Name < Base` are the one deliberate exception to the mandatory-꧃ rule: since the line starts with `#`, the compiler always treats it as a comment, so normal spaces still work there specifically. Every other legacy token follows the same ꧃ rule as everything else.

Beginner shortcut syntax is also accepted:

```text
say value                       print(value)
ask prompt                      input(prompt)
set name = value                name = value
repeat n:                       for _ in range(n):
```

Written in real Rhubarb, with the mandatory ꧃:

```text
say꧃value
ask꧃prompt
set꧃name꧃=꧃value
repeat꧃n:
```

## Java `∫` Mode

`.rjava` files are Java-like files where `∫` means `;`. The mandatory-꧃ rule does **not** apply to `.rjava` files — they're plain Java with one substitution, not Rhubarb.

Input:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("hello")∫
    }
}
```

Command:

```bash
python3 rhubarb.py examples/Main.rjava --java
```

Output:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("hello");
    }
}
```

## Python To Rhubarb Translation Checklist

When translating Python into official Rhubarbian:

1. Keep indentation exactly like Python, but built from ꧃ instead of spaces.
2. Replace `import x` with `⸘bաhúբ⸘꧃x꧃∫`.
3. Replace `import x as y` with `⸘áաcaբ꧃x꧃⟜꧃y꧃∫`.
4. Replace `from x import y` with `⸘bաhúբ⸘꧃y꧃⟜꧃x꧃∫`.
5. Replace assignment `name = value` with `⸘lաgyբn⸘꧃name꧃⟜꧃value꧃∫`.
6. Replace class definitions with the long class token.
7. Replace function definitions with the long function token and call delimiters; append ` -> ReturnType` after the closer if the original had a return annotation.
8. Replace `for item in thing:` with `⸘jաrjբ꧃item꧃⟜꧃thing꧃∫`.
9. Replace `for _ in range(n):` with `⸘kաröբz⸘꧃n꧃∫` when it is a simple repeat loop.
10. Replace `while`, `if`, `elif`, `else`, `try`, `except`, `return`, and `print` with their Rhubarb tokens.
11. Replace call parentheses in calls with `⟪hաváբ⟫` and `⟪vաgeբ`.
12. Replace common method names with aliases, such as `.upper()` to `.nաgyբetգ⟪hաváբ⟫⟪vաgeբ`.
13. Keep strings in normal readable English unless the user asks otherwise — spaces inside strings and comments are never touched.
14. Add `∫` to Rhubarb statement lines.
15. Replace every remaining structural space or tab (including indentation) with ꧃. When in doubt, run the result through `rhubarb.py --migrate` to double-check.
16. If full reverse mode is requested, reverse every nonblank line and put one trailing `␠` for each leading indentation ꧃.

## Rhubarb To Python Translation Checklist

When translating Rhubarb back into Python:

1. If a reverse marker is present, unreverse the lines first.
2. Verify every structural gap is ꧃, not a literal space or tab (outside strings/comments) — the compiler will refuse to run otherwise and will point at the exact bad character.
3. Convert call delimiters back to parentheses.
4. Convert method aliases back to Python method names.
5. Convert `∫` to nothing at statement endings, or to `;` inside expressions.
6. Convert Rhubarb keyword tokens to Python keywords.
7. Preserve indentation.
8. Leave normal Python fallback lines as normal Python.

## Prompt For Another AI

You can give this prompt to ChatGPT, Claude, or another model:

```text
Translate between Python and Rhubarb using these rules:

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
is fully reversed and trailing ␠ characters represent leading ꧃ indentation.
```

## Complete Example

Python:

```python
class Counter:
    def __init__(self):
        self.items = []

    def add(self, value):
        self.items.append(value)
        return len(self.items)

counter = Counter()
for n in range(3):
    print(counter.add(n))
```

Rhubarb:

```rhubarb
Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk꧃Counter꧃∫
꧃꧃꧃꧃Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃__init__꧃⟪hաváբ⟫꧃self꧃⟪vաgeբ꧃∫
꧃꧃꧃꧃꧃꧃꧃꧃⸘lաgyբn⸘꧃self.items꧃⟜꧃[]꧃∫

꧃꧃꧃꧃Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt꧃add꧃⟪hաváբ⟫꧃self,꧃value꧃⟪vաgeբ꧃∫
꧃꧃꧃꧃꧃꧃꧃꧃self.items.hաzzբfűգ⟪hաváբ⟫value⟪vաgeբ꧃∫
꧃꧃꧃꧃꧃꧃꧃꧃⸘vաssբa⸘꧃len⟪hաváբ⟫self.items⟪vաgeբ꧃∫

⸘lաgyբn⸘꧃counter꧃⟜꧃Counter⟪hաváբ⟫⟪vաgeբ꧃∫
⸘jաrjբ꧃n꧃⟜꧃range⟪hաváբ⟫3⟪vաgeբ꧃∫
꧃꧃꧃꧃⸘kաpdբ꧃counter.add⟪hաváբ⟫n⟪vաgeբ꧃∫
```

## Custom Rhubarb Key & the `/mirror` Terminal Command

Beyond the public Hungarian/Armenian vocabulary above, the IDE can generate a **private** Rhubarb dialect derived from a single key you control. The grammar never changes — `∫`, `⟜`, `⟪…⟫`, the mandatory `꧃` — but every keyword (`if`, `while`, `class`, `def`, `import`, `import...as`, `for`, `for _ in range(n)`, `try`, `except`, `return`, `print`) and all 18 method aliases are replaced with a different, unpredictable nonsense word, deterministically derived from that key. The cipher is symmetric: whichever key encoded a file is the only key that decodes it back, and two different keys never produce the same vocabulary. A `.rhubarb` file written in someone else's private dialect is just noise.

### How it works, in the IDE

1. Click the key icon in the sidebar toolbar to open the **Keys** panel, then click **Generate New Key** (or type in one of your own — 12 characters, letters and digits) and **Save Key**.
2. Open the **Terminal** tab in the bottom panel (next to Output) and `cd` into whichever directory you want to encode.
3. Type `/mirror` and press Enter — this is the *only* thing that triggers mirroring, and it only ever goes Python → Rhubarb, never the other way. It creates a sibling folder named `<dirname>-rhubarb` and translates every `.py` file under the current directory into the private dialect there, mirroring the same folder structure.
4. Opening or running a `.rhubarb` file that lives inside a `*-rhubarb` mirror folder decodes it with whatever key is currently saved. If that's a different key than the one that encoded it, decoding fails loudly (a mandatory-space/syntax error) rather than silently producing something wrong.
5. **Clear Key** removes the saved key and deletes `.rhubarb_keys.json` — any mirror folders already on disk are left untouched.

Outside of `/mirror`, the terminal behaves like an ordinary shell: typed commands run via `subprocess` in the tracked directory, and `cd` persists across commands the way a real terminal's would.

### Telling private-dialect files apart from public ones

Since `.rhubarb` files are never syntax-highlighted (by design — see below), a plain glance at file content can't tell you which dialect you're looking at. The IDE marks this visually instead: any `.rhubarb` file living inside a `*-rhubarb` mirror folder gets a small padlock badge on its file icon — in the sidebar tree and on its editor tab — and the topbar shows a "🔒 PRIVATE DIALECT" pill whenever such a file is the active tab. Hovering either gives the same explanation as a tooltip. A `.rhubarb` file anywhere else in the workspace is the ordinary public dialect and never gets the badge.

### What the encoder covers

The Python → private-Rhubarb direction is new: the original compiler only ever went the other way (Rhubarb → Python). `rhubarb_encode.py` walks a real Python AST — not a line-by-line guess — and supports `import` / `from...import` / `import...as`, single-target assignment, class definitions (0 or 1 base), function definitions with any argument shape and an optional return annotation, `for` (including the `for _ in range(n):` repeat shorthand), `while`, `if`/`elif`/`else`, `try`/`except` (any number of handlers), `return`, `print(...)`, arbitrary calls and method calls (aliased the same way as the public dialect), and f-strings. Anything else — comprehensions, decorators, the walrus operator, chained assignment, `with` blocks — still comes through as valid, readable Python, just without keyword substitution for that one line, so encoding a real file never simply fails outright. Multi-word Python tokens that land inside a Rhubarb line (`is not`, `not in`, `name as alias`) use the mandatory `꧃` character between their words rather than a literal space, same as everywhere else — a literal space anywhere outside a string or comment fails the same mandatory-space check the public dialect enforces.

### Where the key and vocabulary come from

`rhubarb_keys.py` seeds Python's `random.Random` directly from the key and draws a unique nonsense syllable-word (consonant+vowel pairs) for every keyword slot and method alias, retrying on any collision so every word in the vocabulary is distinct. The same key always regenerates the exact same vocabulary; a different key produces a different, unrelated one — this was verified directly: two different keys produce different ciphertext for the same Python source, and decoding one key's output with a different key's vocabulary never recovers the real program.

The key itself is stored in plain text in `.rhubarb_keys.json` inside your workspace (hidden from the file tree the same way any dotfile is — `list_children` skips names starting with `.`). Treat that file the way you'd treat a `.env` file: this is a fun, workspace-local cipher for a joke language, not a hardened secrets system.

# The Rhubarb IDE

`rhubarb_ide.py` launches a desktop app (via [pywebview](https://pywebview.flowrl.com/)) around a React + TypeScript + Tailwind interface that talks to the same Python backend documented above — nothing about how a file is translated, run, or saved differs between the command line and the IDE.

## Launching

```bash
python3 rhubarb_ide.py
```

The built frontend is expected at `rhubarb-ide-webui/dist/index.html`; if it's missing, run `npm install && npm run build` inside `rhubarb-ide-webui/` first.

## Tabs

Multiple files can be open at once. Clicking a file that's already open focuses its existing tab instead of re-reading it from disk, so unsaved edits are never silently discarded. A small dot on a tab means unsaved changes; hovering swaps the dot for a close (×) button. Closing a tab with unsaved changes prompts **Save / Don't Save / Cancel** in a custom themed modal — never a native browser confirm dialog. Closing the active tab selects its left neighbor (or the next tab, if it was the first).

## Sidebar & File Tree

Six icons sit above the file tree:

| Icon | Action |
|---|---|
| Folder with `+` | New Folder, created inline inside whatever's currently selected |
| File with `+` | New File, created inline inside whatever's currently selected |
| Folder | Open Folder — switches the whole workspace (`Ctrl+Shift+O`) |
| File | Open File — native file picker (`Ctrl+O`) |
| Magnifying glass | Toggle the Search panel (`Ctrl+Shift+F`) |
| Key | Open the Keys panel |

**Creating a file or folder** never pops up a native prompt: clicking New File/Folder drops a live-editable row directly into the tree at the right depth, cursor blinking, with a file-type icon that updates live as you type an extension. Enter commits it — files must have a real extension (`name.ext`), folders don't need one. Escape, or clicking anywhere else, cancels without touching the disk.

**Right-click** any file or folder for **Rename**, **Delete**, and **Refresh**, in a small custom themed menu — again, no native prompts or confirm dialogs anywhere in the tree. Deleting a folder deletes everything inside it (after a themed confirmation modal) and automatically closes any tabs open on files that were inside it.

**Drag and drop** any file or folder onto another folder to move it there. Dropping onto a file moves the dragged item into that file's containing folder (matching most real IDEs); dropping onto empty space below the tree moves it to the workspace root. Dropping a folder into itself, or into one of its own subfolders, is rejected both visually (no drop-target highlight) and again on the backend as a safety net. Any open tabs, the expanded/collapsed state of the tree, and the current selection are all remapped automatically after a move.

Clicking a file or folder highlights it — that's also what New File/New Folder use to decide where to create things — and clicking anywhere outside the tree clears the highlight.

File-type icons are extension-aware: `.rhubarb` gets the language's own leaf mark; recognized languages (`.py`, `.java`, `.js`/`.ts`/`.jsx`/`.tsx`, `.json`, `.html`, `.css`, `.xml`, `.yaml`/`.yml`, `.md`) get a colored two-or-three-letter badge; anything unrecognized gets a neutral dot.

## Search & Replace

Click the magnifying glass (or `Ctrl+Shift+F`) to search the whole workspace. `node_modules`, `__pycache__`, `.git`, `dist`, and `build` directories are pruned automatically before they're ever scanned, so this stays fast even in a workspace with a large dependency tree. Results are grouped by file with a match count per file; clicking a line jumps straight to it in the editor with that exact matched substring selected — which also triggers CodeMirror's own "highlight all occurrences of the current selection," lighting up every other instance of that term in the open file. A **Match Case** checkbox re-runs the search live. **Replace All** rewrites every matched file on disk; hovering a single file's result group reveals a per-file **Replace** button instead, for a narrower change.

Inside the editor itself, `Ctrl+F` opens CodeMirror's own built-in find/replace panel — match case, whole word, regex, next/previous, replace, and replace-all, all provided by the editor itself. Right-click anywhere in the editor for a small context menu: **Cut**, **Copy**, **Paste**, **Select All**, **Find**, and **Replace All Occurrences** (opens the find/replace panel pre-filled with whatever text is currently selected).

## Syntax Highlighting

Highlighting is automatic by file extension: Python, Java (`.java` and `.rjava`), JavaScript/JSX, TypeScript/TSX, JSON, HTML, CSS, XML, YAML, and Markdown are all recognized. `.rhubarb` files are deliberately **never** syntax-highlighted — every token renders as plain, uncolored text, matching the language's own "as unreadable as possible" design. Unrecognized extensions fall back to the same plain-text treatment.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` | Save the active tab |
| `Ctrl+N` | New scratch tab (not written to disk until you save it) |
| `Ctrl+O` | Open File (native picker) |
| `Ctrl+Shift+O` | Open Folder (switch workspace) |
| `Ctrl+Shift+N` | New Window |
| `Ctrl+W` | Close the active tab |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Next / previous tab |
| `Ctrl+1` – `Ctrl+9` | Jump to tab N (`Ctrl+9` always means the last tab) |
| `Ctrl+Enter` or `F5` | Run the active file |
| `Ctrl+Shift+P` | Show the translated-Python preview |
| `Ctrl+Shift+F` | Toggle the workspace Search panel |
| `Escape` | Close whatever modal or context menu is currently on top |

These are handled by a single allowlisted `keydown` listener — only the combinations above are intercepted — so CodeMirror's own bindings (`Ctrl+Z`/`Ctrl+Y` undo/redo, `Ctrl+F` search, `Ctrl+/` comment-toggle, `Ctrl+D` select-next-occurrence, and so on) keep working completely untouched inside the editor. While any modal or context menu is open, only `Escape` is honored, so e.g. `Ctrl+S` can't fire behind an open close-confirmation dialog.

## Output, Terminal, Run, and Show Python

The bottom panel has two tabs. **Output** shows the result of **Run** (the play-button icon, top right): it saves the active file if it needs saving, then executes it exactly the way `python3 rhubarb.py file.rhubarb` would from a terminal, with standard output and any error text appearing there. **Terminal** is an interactive shell scoped to a tracked current directory (shown in its prompt) — typed commands run via `subprocess`, `cd` persists across commands, and typing `/mirror` runs the Python → private-Rhubarb encoder described above instead of being sent to the shell. **Show Python** opens a read-only, fully syntax-highlighted preview of the translated Python in a modal, without running anything — handy for checking a translation before committing to running it. Running or previewing a private-dialect `.rhubarb` file (one inside a `*-rhubarb` mirror folder) decodes with whatever key is currently saved in the Keys panel.

## New Window

`Ctrl+Shift+N` opens a second, fully independent IDE window pointed at the same workspace, including whichever key is currently saved.

## Codebase Overview

| File / folder | What it does |
|---|---|
| `rhubarb.py` | The compiler: `translate()` (Rhubarb → Python), `migrate_spaces_to_mandatory()`, the mandatory-space validator (`enforce_mandatory_space_character`), the string/comment/f-string-aware line scanner (`scan_code_segments`), reverse-line-mode support, and the `TokenSet` dataclass that both the public vocabulary (`DEFAULT_TOKENS`) and any custom keyed vocabulary plug into. Runnable standalone with `--python`, `--java`, or `--migrate`. |
| `rhubarb_encode.py` | The compiler's other direction: a Python-AST-based encoder that turns `.py` source into Rhubarb shaped by whichever `TokenSet` it's given. Powers the `/mirror` terminal command; not exposed as its own CLI flag. |
| `rhubarb_keys.py` | Key generation (`generate_key`) and deterministic `TokenSet` derivation (`derive_token_set`) for the custom private dialect — a single, symmetric key drives both directions. |
| `rhubarb_ide.py` | The desktop app: a pywebview `Api` class exposed to the frontend, covering the file tree, tabs, search/replace, run/translate, the terminal (`terminal_run`, `get_terminal_cwd`), the `/mirror` encoder (`_mirror_directory`), and key storage (`save_keys`, `get_keys_status`, and friends). Every instance attribute on `Api` is underscore-prefixed on purpose — pywebview recursively walks every *public* attribute looking for nested API namespaces, and a `Path` or `Window` stored under a public name causes infinite recursion into WinForms internals. |
| `rhubarb_ide_tk_backup.py` | The IDE's original Tkinter version, kept for reference; no longer maintained or wired up to newer features. |
| `rhubarb-ide-webui/` | The React + TypeScript + Tailwind frontend: a CodeMirror 6 editor, tabs, sidebar with drag-and-drop and inline create, workspace search, the Keys modal, and the Output/Terminal bottom panel. Built with Vite; `npm run build` outputs to `dist/`, which `rhubarb_ide.py` loads directly as its window contents. |
| `examples/`, `test.rhubarb`, `ereg/`, `JavaSpace/` | Sample `.rhubarb` programs, including partial- and full-reverse-line-mode demonstrations and a complete Tkinter application (`JavaSpace/java_editor.rhubarb`) written entirely in Rhubarb. |
