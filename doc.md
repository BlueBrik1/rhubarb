# Rhubarb Language Spec

Rhubarb is a tiny language that translates into Python. A `.rhubarb` file can contain normal Python, but the official Rhubarbian syntax replaces Python keywords with intentionally awkward Hungarian/Armenian-looking tokens.

Use this README as a translator guide. Someone who knows Python should be able to translate Python to Rhubarb and Rhubarb back to Python from these rules.

## Core Idea

- Rhubarb preserves Python indentation rules. Blocks are still created by indenting the next lines.
- Rhubarb expressions are mostly Python expressions.
- Python strings stay normal strings. User-facing text can be English.
- Rhubarb statement lines often end with `∫`. In `.rhubarb` Python mode, a trailing `∫` is removed from statements that match a recognized Rhubarb keyword pattern (import, assignment, class, def, for, while, if/elif/else, try/except, return, print). On lines that don't match any recognized pattern — including plain Python fallback lines and malformed Rhubarb lines — a trailing `∫` is **not** removed; it is converted to `;` instead, same as inside expressions. The result is still valid Python (a trailing semicolon is harmless), but it is not actually removed.
- Inside expressions, `∫` translates to `;`. This same `;`-conversion (rather than removal) also applies to trailing `∫` on any fallback line, per above.
- Normal Python lines are allowed if they do not match Rhubarb syntax.

## Run Commands

```bash
python3 rhubarb.py file.rhubarb
python3 rhubarb.py file.rhubarb --python
python3 rhubarb.py file.rjava --java
python3 rhubarb_ide.py
```

## Exact Token List

Use the Armenianized token first. The plain Hungarian token is also accepted for most rules, but generated Rhubarbian should prefer the Armenianized form.

```text
Python                         Rhubarb
import module                  ⸘bաhúբ⸘ module ∫
import module as alias          ⸘áաcaբ module ⟜ alias ∫
from module import names        ⸘bաhúբ⸘ names ⟜ module ∫
name = value                    ⸘lաgyբn⸘ name ⟜ value ∫
class Name:                     Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk Name ∫
class Name(Base):               Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk Name ⟜ Base ∫
def name(args):                 Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt name ⟪hաváբ⟫ args ⟪vաgeբ ∫
for item in collection:         ⸘jաrjբ item ⟜ collection ∫
for _ in range(n):              ⸘kաröբz⸘ n ∫
while condition:                ⸘aաígբ condition ∫
if condition:                   ⸘hա⸘ condition ∫
elif condition:                 ⸘mաs-բa⸘ condition ∫
else:                           ⸘kաlöբbeգ⸘ ∫
try:                            ⸘pաóbբ⸘ ∫
except:                         ⸘jաj⸘ ∫
except Error:                   ⸘jաj⸘ Error ∫
return value                    ⸘vաssբa⸘ value ∫
print(value)                    ⸘kաpdբ value ∫
call(args)                      call⟪hաváբ⟫args⟪vաgeբ
```

Important: the call closer token is exactly `⟪vաgeբ`. It does not include the final `⟫`.

## Function And Call Examples

Python:

```python
def shout(word):
    return word.upper() + "!"

print(shout("hello"))
```

Rhubarb:

```rhubarb
Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt shout ⟪hաváբ⟫ word ⟪vաgeբ ∫
    ⸘vաssբa⸘ word.nաgyբetգ⟪hաváբ⟫⟪vաgeբ + "!" ∫

⸘kաpdբ shout⟪hաváբ⟫"hello"⟪vաgeբ ∫
```

## Import Rules

```text
⸘bաhúբ⸘ subprocess ∫
```

translates to:

```python
import subprocess
```

```text
⸘áաcaբ tkinter ⟜ tk ∫
```

translates to:

```python
import tkinter as tk
```

```text
⸘bաhúբ⸘ Path ⟜ pathlib ∫
```

translates to:

```python
from pathlib import Path
```

Multiple imported names are allowed:

```text
⸘bաhúբ⸘ filedialog, messagebox, simpledialog ⟜ tkinter ∫
```

translates to:

```python
from tkinter import filedialog, messagebox, simpledialog
```

## Assignment Rules

```text
⸘lաgyբn⸘ x ⟜ 5 ∫
⸘lաgyբn⸘ name ⟜ "Mihir" ∫
⸘lաgyբn⸘ nums ⟜ [2, 7, 11, 15] ∫
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
Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk App ∫
    pass

Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk Window ⟜ tk.Tk ∫
    pass
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
Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt add ⟪hաváբ⟫ a, b ⟪vաgeբ ∫
    ⸘vաssբa⸘ a + b ∫
```

**Known limitation:** the `def` pattern only matches when the call closer `⟪vաgeբ` is the last thing on the line (before the trailing `∫`). Anything after the closer — most commonly a return-type annotation like `-> int` — prevents the line from being recognized as a function definition at all. In that case the line silently falls through to generic fallback handling: the function-name token, parentheses, and Rhubarb-isms are *not* translated, and the result is broken Python. Argument-level type hints inside the parentheses (e.g. `height: list[int]`) are unaffected and work fine — only a return-type annotation trailing the closing `⟪vաgeբ` causes a problem. If you need to preserve a return type, write the line as a plain Python fallback `def` instead of using the Rhubarb function token.

```text
Works:    Elաelբ...rt trap ⟪hաváբ⟫ self, height: list[int] ⟪vաgeբ ∫
Breaks:   Elաelբ...rt trap ⟪hաváբ⟫ self, height: list[int] ⟪vաgeբ -> int ∫
```

Accepted older function tokens:

```text
Elkelkáposztástalaníthatatlanságoskodásaitokért
⸘függvény⸘
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
⸘hա⸘ x > 10 ∫
    ⸘kաpdբ "big" ∫
⸘mաs-բa⸘ x == 10 ∫
    ⸘kաpdբ "ten" ∫
⸘kաlöբbeգ⸘ ∫
    ⸘kաpdբ "small" ∫
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
⸘jաrjբ n ⟜ range⟪hաváբ⟫1, 6⟪vաgeբ ∫
    ⸘kաpdբ n ∫

⸘kաröբz⸘ 3 ∫
    ⸘kաpdբ "again" ∫

⸘aաígբ running ∫
    ⸘kաpdբ "tick" ∫
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
⸘pաóbբ⸘ ∫
    risky⟪hաváբ⟫⟪vաgeբ ∫
⸘jաj⸘ ValueError as error ∫
    ⸘kաpdբ error ∫
⸘jաj⸘ ∫
    ⸘kաpdբ "unknown" ∫
```

## Expression Rules

Most expressions stay Python:

```text
x + y
nums[0]
data["key"]
len⟪hաváբ⟫items⟪vաgeբ
lambda path: path.name.lower⟪hաváբ⟫⟪vաgeբ
f"Hello {name}"
```

Translate call parentheses like this:

```text
Python            Rhubarb
fn()              fn⟪hաváբ⟫⟪vաgeբ
fn(a, b)          fn⟪hաváբ⟫a, b⟪vաgeբ
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
⸘lաgyբn⸘ name ⟜ "rhubarb" ∫
⸘kաpdբ name.nաgyբetգ⟪hաváբ⟫⟪vաgeբ ∫
```

translates to:

```python
name = "rhubarb"
print(name.upper())
```

## Reversed Line Modes

Rhubarb can read source where each line is written backwards.

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
∫ "olleh" բdpաk⸘
```

becomes:

```rhubarb
⸘kաpdբ "hello" ∫
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

Because full reversal would move indentation to the right side, indentation is encoded with visible `␠` characters at the end of the reversed line.

Example forward Rhubarb:

```rhubarb
⸘hա⸘ True ∫
    ⸘kաpdբ "yes" ∫
```

Full-reversed Rhubarb:

```rhubarb
SENIL_ESREVER_BRABUHR #
∫ eurT ⸘աh⸘
∫ "sey" բdpաk⸘␠␠␠␠
```

The four trailing `␠` characters become four real leading spaces after unreversing.

## Legacy Syntax

Old Rhubarb syntax is still accepted.

```text
Python                         Legacy Rhubarb
import module                  @+ module
import module as alias          @+ module => alias
from module import names        @+ names <- module
name = value                    @= name <- value
class Name:                     @# Name
class Name(Base):               @# Name < Base
def name(args):                 @! name $^--args--^$
for item in collection:         @> item <- collection
for _ in range(n):              @@ n
while condition:                @~ condition
if condition:                   @? condition
elif condition:                 @?? condition
else:                           @:
try:                            @!:
except Error:                   @!! Error
except:                         @!!
return value                    << value
print(value)                    ~> value
call(args)                      call$^--args--^$
```

Beginner shortcut syntax is also accepted:

```text
say value                       print(value)
ask prompt                      input(prompt)
set name = value                name = value
repeat n:                       for _ in range(n):
```

## Java `∫` Mode

`.rjava` files are Java-like files where `∫` means `;`.

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

1. Keep indentation exactly like Python.
2. Replace `import x` with `⸘bաhúբ⸘ x ∫`.
3. Replace `import x as y` with `⸘áաcaբ x ⟜ y ∫`.
4. Replace `from x import y` with `⸘bաhúբ⸘ y ⟜ x ∫`.
5. Replace assignment `name = value` with `⸘lաgyբn⸘ name ⟜ value ∫`.
6. Replace class definitions with the long class token.
7. Replace function definitions with the long function token and call delimiters. Do not add anything after the closing `⟪vաgeբ` (e.g. a `-> ReturnType` annotation) — the function token only translates correctly when the closer is the last thing on the line; otherwise leave the `def` as plain Python.
8. Replace `for item in thing:` with `⸘jաrjբ item ⟜ thing ∫`.
9. Replace `for _ in range(n):` with `⸘kաröբz⸘ n ∫` when it is a simple repeat loop.
10. Replace `while`, `if`, `elif`, `else`, `try`, `except`, `return`, and `print` with their Rhubarb tokens.
11. Replace call parentheses in calls with `⟪hաváբ⟫` and `⟪vաgeբ`.
12. Replace common method names with aliases, such as `.upper()` to `.nաgyբetգ⟪hաváբ⟫⟪vաgeբ`.
13. Keep strings in normal readable English unless the user asks otherwise.
14. Add `∫` to Rhubarb statement lines that use a recognized keyword token; it will be removed on translation. Avoid relying on `∫` for plain Python fallback lines, since it converts to `;` there instead of being removed.
15. If full reverse mode is requested, reverse every nonblank line and put one trailing `␠` for each leading indentation space.

## Rhubarb To Python Translation Checklist

When translating Rhubarb back into Python:

1. If a reverse marker is present, unreversed the lines first.
2. Convert call delimiters back to parentheses.
3. Convert method aliases back to Python method names.
4. Convert `∫` to nothing at statement endings *for recognized keyword statements*; convert it to `;` inside expressions and on any line that falls through to generic/fallback handling (including a malformed `def` line — see the function-rules limitation above).
5. Convert Rhubarb keyword tokens to Python keywords.
6. Preserve indentation.
7. Leave normal Python fallback lines as normal Python.

## Prompt For Another AI

You can give this prompt to ChatGPT, Claude, or another model:

```text
Translate between Python and Rhubarb using these rules:

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

If source begins with SENIL_ESREVER_BRABUHR #, every nonblank line after that is fully reversed and trailing ␠ characters represent leading indentation spaces.
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
Leաesբegգegդzeեtsզgtէleըítթetժetիtlլneխbjծitկknհk Counter ∫
    Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt __init__ ⟪hաváբ⟫ self ⟪vաgeբ ∫
        ⸘lաgyբn⸘ self.items ⟜ [] ∫

    Elաelբápգszդásեalզníէhaըatթanժágիskլdáխaiծokկrt add ⟪hաváբ⟫ self, value ⟪vաgeբ ∫
        self.items.hաzzբfűգ⟪hաváբ⟫value⟪vաgeբ ∫
        ⸘vաssբa⸘ len⟪hաváբ⟫self.items⟪vաgeբ ∫

⸘lաgyբn⸘ counter ⟜ Counter⟪hաváբ⟫⟪vաgeբ ∫
⸘jաrjբ n ⟜ range⟪hաváբ⟫3⟪vաgeբ ∫
    ⸘kաpdբ counter.add⟪hաváբ⟫n⟪vաgeբ ∫
```
