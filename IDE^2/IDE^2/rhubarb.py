#!/usr/bin/env python3
"""Rhubarb language runner.

Rhubarb compiles absurd .rhubarb source into Python. Plain Python and the
earlier Rhubarb shortcuts still work, but the preferred surface syntax is
intentionally awkward and Hungarian-flavored.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


ARMENIAN_FILL = "աբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցւփքօֆ"
VISIBLE_REVERSED_INDENT = "␠"


def armenianize_every_third(text: str) -> str:
    result: list[str] = []
    fill_index = 0
    for index, character in enumerate(text, start=1):
        if index % 3 == 0 and not character.isspace():
            result.append(ARMENIAN_FILL[fill_index % len(ARMENIAN_FILL)])
            fill_index += 1
        else:
            result.append(character)
    return "".join(result)


CALL_PAIRS = (
    (armenianize_every_third("⟪hívás⟫"), armenianize_every_third("⟪vége⟫")),
    ("⟪hívás⟫", "⟪vége⟫"),
    ("$^--", "--^$"),
)

METHOD_ALIASES = {
    ".nagybetű": ".upper",
    ".kisbetű": ".lower",
    ".darabol": ".split",
    ".összeragaszt": ".join",
    ".kezdődik": ".startswith",
    ".végződik": ".endswith",
    ".csupaszít": ".strip",
    ".jobbcsupaszít": ".rstrip",
    ".balcsupaszít": ".lstrip",
    ".csereberél": ".replace",
    ".keres": ".find",
    ".számol": ".count",
    ".hozzáfűz": ".append",
    ".kibővít": ".extend",
    ".bedug": ".insert",
    ".kidob": ".pop",
    ".rendez": ".sort",
    ".másolat": ".copy",
}

for alias, python_name in tuple(METHOD_ALIASES.items()):
    METHOD_ALIASES[armenianize_every_third(alias)] = python_name

REVERSE_LINE_MARKERS = (
    "# RHUBARB_REVERSE_LINES",
    "# SENIL_ESREVER_BRAHBUHR",
    "# SENIL_ESREVER_BRABUHR",
    "SENIL_ESREVER_BRABUHR #",
)

CLASS_TOKENS = (
    armenianize_every_third("Legeslegmegszentségteleníttethetetlenebbjeiteknek"),
    "Legeslegmegszentségteleníttethetetlenebbjeiteknek",
    "⸘osztály⸘",
)

FUNCTION_TOKENS = (
    armenianize_every_third("Elkelkáposztástalaníthatatlanságoskodásaitokért"),
    "Elkelkáposztástalaníthatatlanságoskodásaitokért",
    "⸘függvény⸘",
)

IMPORT_TOKENS = (armenianize_every_third("⸘behúz⸘"), "⸘behúz⸘")
IMPORT_AS_TOKENS = (armenianize_every_third("⸘álca⸘"), "⸘álca⸘")
ASSIGN_TOKENS = (armenianize_every_third("⸘legyen⸘"), "⸘legyen⸘")
FOR_TOKENS = (armenianize_every_third("⸘járj⸘"), "⸘járj⸘")
REPEAT_TOKENS = (armenianize_every_third("⸘körözz⸘"), "⸘körözz⸘")
WHILE_TOKENS = (armenianize_every_third("⸘amíg⸘"), "⸘amíg⸘")
IF_TOKENS = (armenianize_every_third("⸘ha⸘"), "⸘ha⸘")
ELIF_TOKENS = (armenianize_every_third("⸘más-ha⸘"), "⸘más-ha⸘")
ELSE_TOKENS = (armenianize_every_third("⸘különben⸘"), "⸘különben⸘")
TRY_TOKENS = (armenianize_every_third("⸘próba⸘"), "⸘próba⸘")
EXCEPT_TOKENS = (armenianize_every_third("⸘jaj⸘"), "⸘jaj⸘")
RETURN_TOKENS = (armenianize_every_third("⸘vissza⸘"), "⸘vissza⸘")
PRINT_TOKENS = (armenianize_every_third("⸘köpd⸘"), "⸘köpd⸘")


def translate_expression(source: str) -> str:
    translated = source
    for source_name, python_name in METHOD_ALIASES.items():
        translated = translated.replace(source_name, python_name)
    for opener, closer in CALL_PAIRS:
        translated = translated.replace(opener, "(").replace(closer, ")")
    return translated.replace("∫", ";")


def peel_token(body: str, tokens: tuple[str, ...]) -> tuple[str, str] | None:
    for token in tokens:
        if body == token:
            return token, ""
        if body.startswith(f"{token} "):
            return token, body[len(token) + 1 :].strip()
    return None


def translate_line(line: str) -> str:
    stripped = line.lstrip()
    indent = line[: len(line) - len(stripped)]
    newline = "\n" if line.endswith("\n") else ""
    body = stripped[:-1] if newline else stripped
    body = body.rstrip()
    if body.endswith("∫"):
        body = body[:-1].rstrip()

    if not stripped or stripped.startswith("#"):
        return line

    peeled = peel_token(body, IMPORT_TOKENS)
    if peeled:
        _, rest = peeled
        if " ⟜ " in rest:
            names, module = rest.split(" ⟜ ", 1)
            return f"{indent}from {translate_expression(module.strip())} import {translate_expression(names.strip())}{newline}"
        return f"{indent}import {translate_expression(rest)}{newline}"

    peeled = peel_token(body, IMPORT_AS_TOKENS)
    if peeled:
        _, rest = peeled
        if " ⟜ " in rest:
            module, alias = rest.split(" ⟜ ", 1)
            return f"{indent}import {translate_expression(module.strip())} as {translate_expression(alias.strip())}{newline}"

    peeled = peel_token(body, ASSIGN_TOKENS)
    if peeled:
        _, rest = peeled
        if " ⟜ " in rest:
            name, value = rest.split(" ⟜ ", 1)
            return f"{indent}{translate_expression(name.strip())} = {translate_expression(value.strip())}{newline}"

    for class_token in CLASS_TOKENS:
        if body.startswith(f"{class_token} "):
            rest = body[len(class_token) + 1 :].strip()
            if " ⟜ " in rest:
                name, base = rest.split(" ⟜ ", 1)
                return f"{indent}class {translate_expression(name.strip())}({translate_expression(base.strip())}):{newline}"
            return f"{indent}class {translate_expression(rest)}:{newline}"

    for function_token in FUNCTION_TOKENS:
        if body.startswith(f"{function_token} "):
            rest = body[len(function_token) + 1 :].strip()
            for opener, closer in CALL_PAIRS:
                pattern = rf"([\w\u0080-\uffff.]+)\s+{re.escape(opener)}(.*){re.escape(closer)}"
                match = re.fullmatch(pattern, rest)
                if match:
                    return f"{indent}def {match.group(1)}({translate_expression(match.group(2))}):{newline}"

    peeled = peel_token(body, FOR_TOKENS)
    if peeled:
        _, rest = peeled
        if " ⟜ " in rest:
            name, value = rest.split(" ⟜ ", 1)
            return f"{indent}for {translate_expression(name.strip())} in {translate_expression(value.strip())}:{newline}"

    peeled = peel_token(body, REPEAT_TOKENS)
    if peeled:
        _, rest = peeled
        return f"{indent}for _ in range({translate_expression(rest)}):{newline}"

    peeled = peel_token(body, WHILE_TOKENS)
    if peeled:
        _, rest = peeled
        return f"{indent}while {translate_expression(rest)}:{newline}"

    peeled = peel_token(body, IF_TOKENS)
    if peeled:
        _, rest = peeled
        return f"{indent}if {translate_expression(rest)}:{newline}"

    peeled = peel_token(body, ELIF_TOKENS)
    if peeled:
        _, rest = peeled
        return f"{indent}elif {translate_expression(rest)}:{newline}"

    if body in ELSE_TOKENS:
        return f"{indent}else:{newline}"

    if body in TRY_TOKENS:
        return f"{indent}try:{newline}"

    peeled = peel_token(body, EXCEPT_TOKENS)
    if peeled:
        _, rest = peeled
        if rest:
            return f"{indent}except {translate_expression(rest)}:{newline}"
        return f"{indent}except:{newline}"

    peeled = peel_token(body, RETURN_TOKENS)
    if peeled:
        _, rest = peeled
        return f"{indent}return {translate_expression(rest)}{newline}"

    peeled = peel_token(body, PRINT_TOKENS)
    if peeled:
        _, rest = peeled
        return f"{indent}print({translate_expression(rest)}){newline}"

    if body.startswith("@+ "):
        rest = body[3:].strip()
        if " => " in rest:
            module, alias = rest.split(" => ", 1)
            return f"{indent}import {translate_expression(module.strip())} as {translate_expression(alias.strip())}{newline}"
        if " <- " in rest:
            names, module = rest.split(" <- ", 1)
            return f"{indent}from {translate_expression(module.strip())} import {translate_expression(names.strip())}{newline}"
        return f"{indent}import {translate_expression(rest)}{newline}"

    if body.startswith("@= "):
        rest = body[3:].strip()
        if " <- " in rest:
            name, value = rest.split(" <- ", 1)
            return f"{indent}{translate_expression(name.strip())} = {translate_expression(value.strip())}{newline}"

    if body.startswith("@# "):
        rest = body[3:].strip()
        if " < " in rest:
            name, base = rest.split(" < ", 1)
            return f"{indent}class {name.strip()}({translate_expression(base.strip())}):{newline}"
        return f"{indent}class {rest}:{newline}"

    if body.startswith("@! "):
        rest = body[3:].strip()
        match = re.fullmatch(r"([A-Za-z_][\w.]*)\s+\$\^--(.*)--\^\$", rest)
        if match:
            return f"{indent}def {match.group(1)}({match.group(2)}):{newline}"

    if body.startswith("@> "):
        rest = body[3:].strip()
        if " <- " in rest:
            name, value = rest.split(" <- ", 1)
            return f"{indent}for {translate_expression(name.strip())} in {translate_expression(value.strip())}:{newline}"

    if body.startswith("@~ "):
        return f"{indent}while {translate_expression(body[3:].strip())}:{newline}"

    if body.startswith("@? "):
        return f"{indent}if {translate_expression(body[3:].strip())}:{newline}"

    if body == "@:":
        return f"{indent}else:{newline}"

    if body.startswith("@?? "):
        return f"{indent}elif {translate_expression(body[4:].strip())}:{newline}"

    if body == "@!:":
        return f"{indent}try:{newline}"

    if body.startswith("@!! "):
        rest = body[4:].strip()
        return f"{indent}except {translate_expression(rest)}:{newline}"

    if body == "@!!":
        return f"{indent}except:{newline}"

    if body.startswith("<< "):
        return f"{indent}return {translate_expression(body[3:].strip())}{newline}"

    if body.startswith("~> "):
        return f"{indent}print({translate_expression(body[3:].strip())}){newline}"

    if body.startswith("@@ "):
        return f"{indent}for _ in range({translate_expression(body[3:].strip())}):{newline}"

    if stripped.startswith("say "):
        return f"{indent}print({translate_expression(stripped[4:].rstrip())})\n"

    if stripped.startswith("ask "):
        return f"{indent}input({translate_expression(stripped[4:].rstrip())})\n"

    if stripped.startswith("set "):
        return f"{indent}{translate_expression(stripped[4:])}"

    if stripped.startswith("repeat ") and stripped.rstrip().endswith(":"):
        amount = stripped[len("repeat ") :].rstrip()[:-1].strip()
        return f"{indent}for _ in range({translate_expression(amount)}):\n"

    return indent + translate_expression(stripped)


def translate(source: str) -> str:
    if uses_reversed_lines(source):
        source = unreversed_source(source, reverse_whole_line=uses_whole_reversed_lines(source))
    return "".join(translate_line(line) for line in source.splitlines(True))


def uses_reversed_lines(source: str) -> bool:
    for line in source.splitlines()[:8]:
        if line.strip() in REVERSE_LINE_MARKERS:
            return True
    return False


def uses_whole_reversed_lines(source: str) -> bool:
    for line in source.splitlines()[:8]:
        if line.strip() == "SENIL_ESREVER_BRABUHR #":
            return True
    return False


def unreversed_source(source: str, reverse_whole_line: bool = False) -> str:
    lines: list[str] = []
    for line in source.splitlines(True):
        newline = "\n" if line.endswith("\n") else ""
        body = line[:-1] if newline else line
        if not body.strip():
            lines.append(line)
            continue
        if reverse_whole_line:
            visible_indent = len(body) - len(body.rstrip(VISIBLE_REVERSED_INDENT))
            if visible_indent:
                body = body[: -visible_indent]
            lines.append(f"{' ' * visible_indent}{body[::-1]}{newline}")
            continue
        if body.strip() in REVERSE_LINE_MARKERS or body.lstrip().startswith("#"):
            lines.append(line)
            continue
        stripped = body.lstrip()
        indent = body[: len(body) - len(stripped)]
        lines.append(f"{indent}{stripped[::-1]}{newline}")
    return "".join(lines)


def translate_java(source: str) -> str:
    return source.replace("∫", ";")


def run_rhubarb(path: Path) -> None:
    source = path.read_text(encoding="utf-8")
    python_source = translate(source)
    old_path = list(sys.path)
    sys.path.insert(0, str(path.parent))
    try:
        exec(
            compile(python_source, str(path), "exec"),
            {"__name__": "__main__", "__file__": str(path), "__package__": None},
        )
    finally:
        sys.path[:] = old_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Run or translate .rhubarb files.")
    parser.add_argument("file", type=Path, help="A .rhubarb file to run.")
    parser.add_argument(
        "--python",
        action="store_true",
        help="Print the translated Python instead of running it.",
    )
    parser.add_argument(
        "--java",
        action="store_true",
        help="Print Java source with ∫ translated into semicolons.",
    )
    args = parser.parse_args()

    if not args.file.exists():
        print(f"Rhubarb could not find {args.file}", file=sys.stderr)
        return 1

    source = args.file.read_text(encoding="utf-8")
    if args.java:
        print(translate_java(source), end="")
        return 0

    if args.python:
        print(translate(source), end="")
        return 0

    try:
        run_rhubarb(args.file)
    except Exception as error:
        print(f"Rhubarb error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
