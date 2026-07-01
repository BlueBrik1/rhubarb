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
from dataclasses import dataclass, field
from pathlib import Path


ARMENIAN_FILL = "աբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցւփքօֆ"
VISIBLE_REVERSED_INDENT = "␠"
MANDATORY_SPACE_CHAR = "꧃"


class RhubarbSyntaxError(SyntaxError):
    """Raised for a structural Rhubarb violation (not a Python-level error),
    with a precise line/column pointer and a caret-annotated source snippet,
    in the style of a real compiler diagnostic."""


def _raise_detailed(message: str, line_no: int, column: int, raw_line: str) -> None:
    caret = " " * column + "^"
    raise RhubarbSyntaxError(
        "\n"
        f"  line {line_no}, column {column + 1}\n"
        f"    {raw_line}\n"
        f"    {caret}\n"
        f"RhubarbSyntaxError: {message}"
    )


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
    # The closer is deliberately missing its own closing ⟫ — armenianizing
    # "⟪vége⟫" happens to replace that trailing ⟫ with a letter (since
    # armenianize_every_third substitutes every 3rd non-space character),
    # so the plain Hungarian closer is written the same bracket-less way
    # here for consistency, matching the documented convention exactly.
    (armenianize_every_third("⟪hívás⟫"), armenianize_every_third("⟪vége⟫")),
    ("⟪hívás⟫", "⟪vége"),
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


@dataclass(frozen=True)
class TokenSet:
    """The keyword vocabulary the decoder recognizes. DEFAULT_TOKENS is the
    fixed, public Hungarian/Armenian vocabulary every .rhubarb file has
    always used, including the classic grammar symbols (⟜, ⟪hívás⟫/⟪vége).
    A custom TokenSet (see rhubarb_keys.py) swaps in a key-derived private
    vocabulary instead — and, critically, *also* key-derives the assignment
    separator and call delimiters (assign_sep/call_open/call_close) rather
    than reusing the fixed public ones. Those grammar symbols used to be
    the same literal strings in every private-dialect file regardless of
    key, which meant the *shape* of a private-dialect file (which tokens
    take an argument, which use ⟜, which are calls) was fully public and
    identical across every key — enough on its own to reconstruct the
    Python source structurally, without ever knowing the key. Deriving
    them per key closes that: translate() still works completely
    unchanged either way, but there is no longer a single fixed formula
    that reverses every private-dialect file at once."""

    import_: tuple[str, ...]
    import_as: tuple[str, ...]
    assign: tuple[str, ...]
    class_: tuple[str, ...]
    function: tuple[str, ...]
    for_: tuple[str, ...]
    repeat: tuple[str, ...]
    while_: tuple[str, ...]
    if_: tuple[str, ...]
    elif_: tuple[str, ...]
    else_: tuple[str, ...]
    try_: tuple[str, ...]
    except_: tuple[str, ...]
    return_: tuple[str, ...]
    print_: tuple[str, ...]
    method_aliases: dict[str, str] = field(default_factory=dict)
    assign_sep: str = "⟜"
    call_open: str = "⟪hívás⟫"
    call_close: str = "⟪vége"


DEFAULT_TOKENS = TokenSet(
    import_=IMPORT_TOKENS,
    import_as=IMPORT_AS_TOKENS,
    assign=ASSIGN_TOKENS,
    class_=CLASS_TOKENS,
    function=FUNCTION_TOKENS,
    for_=FOR_TOKENS,
    repeat=REPEAT_TOKENS,
    while_=WHILE_TOKENS,
    if_=IF_TOKENS,
    elif_=ELIF_TOKENS,
    else_=ELSE_TOKENS,
    try_=TRY_TOKENS,
    except_=EXCEPT_TOKENS,
    return_=RETURN_TOKENS,
    print_=PRINT_TOKENS,
    method_aliases=METHOD_ALIASES,
)


def scan_code_segments(
    line: str, in_triple: str | None = None
) -> tuple[list[tuple[str, bool]], str | None]:
    """Splits one line into (text, is_code) chunks and returns
    (segments, still_open_triple_quote). String literals and trailing
    comments are marked not-code, except for {expr} holes inside f-strings,
    which are still real code — so structural rules (the mandatory ꧃ space
    character, alias/call-token substitution) only ever touch genuine
    Rhubarb syntax, never the user-facing text inside quotes or comments.

    `in_triple` carries a `\"\"\"`/`'''` across calls when a triple-quoted
    string didn't close on the previous line, so multi-line string bodies
    (e.g. an embedded source-code template) are never mistaken for code on
    their continuation lines. The returned second value is the same kind
    of marker for the *next* line, or None once everything closes.

    This is a pragmatic line-level scanner, not a full Python tokenizer: it
    does not recurse into quotes nested inside an f-string {expr} hole
    (e.g. f"{data['a key']}"), so a space inside such a doubly-nested
    string is not recognized as string content. That combination is rare
    enough in practice to accept as a documented limitation.
    """
    segments: list[tuple[str, bool]] = []
    buffer: list[str] = []
    i = 0
    length = len(line)

    def flush() -> None:
        if buffer:
            segments.append(("".join(buffer), True))
            buffer.clear()

    if in_triple:
        close_index = line.find(in_triple)
        if close_index == -1:
            return [(line, False)], in_triple
        segments.append((line[: close_index + 3], False))
        i = close_index + 3
        in_triple = None

    while i < length:
        char = line[i]
        if char == "#":
            flush()
            segments.append((line[i:], False))
            return segments, None
        if char in "\"'":
            flush()
            prefix = line[max(0, i - 2) : i].lower()
            is_fstring = "f" in prefix
            quote = char
            quote_len = 3 if line[i : i + 3] == quote * 3 else 1
            start = i
            i += quote_len
            closed = False
            while i < length:
                two = line[i : i + 2]
                if is_fstring and two in ("{{", "}}"):
                    i += 2
                    continue
                if is_fstring and line[i] == "{":
                    segments.append((line[start:i], False))
                    hole_start = i
                    depth = 1
                    i += 1
                    while i < length and depth:
                        if line[i] == "{":
                            depth += 1
                        elif line[i] == "}":
                            depth -= 1
                        i += 1
                    segments.append((line[hole_start:i], True))
                    start = i
                    continue
                if line[i] == "\\":
                    i += 2
                    continue
                if line[i : i + quote_len] == quote * quote_len:
                    i += quote_len
                    closed = True
                    break
                i += 1
            segments.append((line[start:i], False))
            if not closed and quote_len == 3:
                return segments, quote * 3
            continue
        buffer.append(char)
        i += 1

    flush()
    return segments, None


def translate_expression(source: str, tokens: TokenSet = DEFAULT_TOKENS) -> str:
    pieces: list[str] = []
    segments, _ = scan_code_segments(source)
    for text, is_code in segments:
        if not is_code:
            pieces.append(text)
            continue
        translated = text
        for source_name, python_name in tokens.method_aliases.items():
            translated = translated.replace(source_name, python_name)
        for opener, closer in (*CALL_PAIRS, (tokens.call_open, tokens.call_close)):
            translated = translated.replace(opener, "(").replace(closer, ")")
        pieces.append(translated.replace("∫", ";"))
    return "".join(pieces)


def peel_token(body: str, tokens: tuple[str, ...]) -> tuple[str, str] | None:
    for token in tokens:
        if body == token:
            return token, ""
        if body.startswith(f"{token} "):
            return token, body[len(token) + 1 :].strip()
    return None


def translate_line(line: str, line_no: int = 0, tokens: TokenSet = DEFAULT_TOKENS) -> str:
    stripped = line.lstrip()
    indent = line[: len(line) - len(stripped)]
    newline = "\n" if line.endswith("\n") else ""
    body = stripped[:-1] if newline else stripped
    body = body.rstrip()
    if body.endswith("∫"):
        body = body[:-1].rstrip()

    if not stripped or stripped.startswith("#"):
        return line

    assign_sep = f" {tokens.assign_sep} "

    peeled = peel_token(body, tokens.import_)
    if peeled:
        _, rest = peeled
        if assign_sep in rest:
            names, module = rest.split(assign_sep, 1)
            return f"{indent}from {translate_expression(module.strip(), tokens)} import {translate_expression(names.strip(), tokens)}{newline}"
        return f"{indent}import {translate_expression(rest, tokens)}{newline}"

    peeled = peel_token(body, tokens.import_as)
    if peeled:
        _, rest = peeled
        if assign_sep in rest:
            module, alias = rest.split(assign_sep, 1)
            return f"{indent}import {translate_expression(module.strip(), tokens)} as {translate_expression(alias.strip(), tokens)}{newline}"
        _raise_detailed(
            f"'{peeled[0]}' (import-as) expects 'module {tokens.assign_sep} alias', but got: {rest!r}",
            line_no,
            len(indent),
            line.rstrip("\n"),
        )

    peeled = peel_token(body, tokens.assign)
    if peeled:
        _, rest = peeled
        if assign_sep in rest:
            name, value = rest.split(assign_sep, 1)
            return f"{indent}{translate_expression(name.strip(), tokens)} = {translate_expression(value.strip(), tokens)}{newline}"
        _raise_detailed(
            f"'{peeled[0]}' (assignment) expects 'name {tokens.assign_sep} value', but got: {rest!r}",
            line_no,
            len(indent),
            line.rstrip("\n"),
        )

    for class_token in tokens.class_:
        if body.startswith(f"{class_token} "):
            rest = body[len(class_token) + 1 :].strip()
            if assign_sep in rest:
                name, base = rest.split(assign_sep, 1)
                return f"{indent}class {translate_expression(name.strip(), tokens)}({translate_expression(base.strip(), tokens)}):{newline}"
            return f"{indent}class {translate_expression(rest, tokens)}:{newline}"

    for function_token in tokens.function:
        if body.startswith(f"{function_token} "):
            rest = body[len(function_token) + 1 :].strip()
            for opener, closer in (*CALL_PAIRS, (tokens.call_open, tokens.call_close)):
                pattern = rf"([\w\u0080-\uffff.]+)\s+{re.escape(opener)}(.*){re.escape(closer)}(?:\s*->\s*(.+))?"
                match = re.fullmatch(pattern, rest)
                if match:
                    name, args, return_type = match.group(1), match.group(2).strip(), match.group(3)
                    return_annotation = f" -> {translate_expression(return_type.strip(), tokens)}" if return_type else ""
                    return f"{indent}def {name}({translate_expression(args, tokens)}){return_annotation}:{newline}"
            _raise_detailed(
                f"'{function_token}' (function definition) expects "
                f"'name {tokens.call_open} args {tokens.call_close}', but got: {rest!r}",
                line_no,
                len(indent),
                line.rstrip("\n"),
            )

    peeled = peel_token(body, tokens.for_)
    if peeled:
        _, rest = peeled
        if assign_sep in rest:
            name, value = rest.split(assign_sep, 1)
            return f"{indent}for {translate_expression(name.strip(), tokens)} in {translate_expression(value.strip(), tokens)}:{newline}"
        _raise_detailed(
            f"'{peeled[0]}' (for loop) expects 'item {tokens.assign_sep} collection', but got: {rest!r}",
            line_no,
            len(indent),
            line.rstrip("\n"),
        )

    peeled = peel_token(body, tokens.repeat)
    if peeled:
        _, rest = peeled
        return f"{indent}for _ in range({translate_expression(rest, tokens)}):{newline}"

    peeled = peel_token(body, tokens.while_)
    if peeled:
        _, rest = peeled
        return f"{indent}while {translate_expression(rest, tokens)}:{newline}"

    peeled = peel_token(body, tokens.if_)
    if peeled:
        _, rest = peeled
        return f"{indent}if {translate_expression(rest, tokens)}:{newline}"

    peeled = peel_token(body, tokens.elif_)
    if peeled:
        _, rest = peeled
        return f"{indent}elif {translate_expression(rest, tokens)}:{newline}"

    if body in tokens.else_:
        return f"{indent}else:{newline}"

    if body in tokens.try_:
        return f"{indent}try:{newline}"

    peeled = peel_token(body, tokens.except_)
    if peeled:
        _, rest = peeled
        if rest:
            return f"{indent}except {translate_expression(rest, tokens)}:{newline}"
        return f"{indent}except:{newline}"

    peeled = peel_token(body, tokens.return_)
    if peeled:
        _, rest = peeled
        return f"{indent}return {translate_expression(rest, tokens)}{newline}"

    peeled = peel_token(body, tokens.print_)
    if peeled:
        _, rest = peeled
        return f"{indent}print({translate_expression(rest, tokens)}){newline}"

    if body.startswith("@+ "):
        rest = body[3:].strip()
        if " => " in rest:
            module, alias = rest.split(" => ", 1)
            return f"{indent}import {translate_expression(module.strip(), tokens)} as {translate_expression(alias.strip(), tokens)}{newline}"
        if " <- " in rest:
            names, module = rest.split(" <- ", 1)
            return f"{indent}from {translate_expression(module.strip(), tokens)} import {translate_expression(names.strip(), tokens)}{newline}"
        return f"{indent}import {translate_expression(rest, tokens)}{newline}"

    if body.startswith("@= "):
        rest = body[3:].strip()
        if " <- " in rest:
            name, value = rest.split(" <- ", 1)
            return f"{indent}{translate_expression(name.strip(), tokens)} = {translate_expression(value.strip(), tokens)}{newline}"

    if body.startswith("@# "):
        rest = body[3:].strip()
        if " < " in rest:
            name, base = rest.split(" < ", 1)
            return f"{indent}class {name.strip()}({translate_expression(base.strip(), tokens)}):{newline}"
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
            return f"{indent}for {translate_expression(name.strip(), tokens)} in {translate_expression(value.strip(), tokens)}:{newline}"

    if body.startswith("@~ "):
        return f"{indent}while {translate_expression(body[3:].strip(), tokens)}:{newline}"

    if body.startswith("@? "):
        return f"{indent}if {translate_expression(body[3:].strip(), tokens)}:{newline}"

    if body == "@:":
        return f"{indent}else:{newline}"

    if body.startswith("@?? "):
        return f"{indent}elif {translate_expression(body[4:].strip(), tokens)}:{newline}"

    if body == "@!:":
        return f"{indent}try:{newline}"

    if body.startswith("@!! "):
        rest = body[4:].strip()
        return f"{indent}except {translate_expression(rest, tokens)}:{newline}"

    if body == "@!!":
        return f"{indent}except:{newline}"

    if body.startswith("<< "):
        return f"{indent}return {translate_expression(body[3:].strip(), tokens)}{newline}"

    if body.startswith("~> "):
        return f"{indent}print({translate_expression(body[3:].strip(), tokens)}){newline}"

    if body.startswith("@@ "):
        return f"{indent}for _ in range({translate_expression(body[3:].strip(), tokens)}):{newline}"

    if stripped.startswith("say "):
        return f"{indent}print({translate_expression(stripped[4:].rstrip(), tokens)})\n"

    if stripped.startswith("ask "):
        return f"{indent}input({translate_expression(stripped[4:].rstrip(), tokens)})\n"

    if stripped.startswith("set "):
        return f"{indent}{translate_expression(stripped[4:], tokens)}"

    if stripped.startswith("repeat ") and stripped.rstrip().endswith(":"):
        amount = stripped[len("repeat ") :].rstrip()[:-1].strip()
        return f"{indent}for _ in range({translate_expression(amount, tokens)}):\n"

    # Fall back to a plain Python/expression line. Use `body`, not
    # `stripped` — body already had a trailing ∫ terminator (if any)
    # removed above, e.g. the closing line of a multi-line string
    # assignment (`""" ∫`) still ends its *statement* with ∫ even though
    # the string itself doesn't need it. Using `stripped` here would leak
    # that raw ∫ straight into the generated Python and fail to compile.
    return f"{indent}{translate_expression(body, tokens)}{newline}"


def enforce_mandatory_space_character(source: str) -> str:
    """Rhubarb has no ordinary space or tab character in its structural
    syntax — every gap between tokens, including indentation, must be
    written as the mandatory space character ꧃ (U+A9C3). A literal space
    or tab found outside a string literal or comment is a hard compile
    error with a precise line/column pointer. Space and tab remain
    perfectly normal *inside* string literals and comments, since that's
    just data, not syntax, and user-facing text can stay readable English.

    On success, every ꧃ outside strings/comments is normalized back to a
    real space so the rest of the pipeline (which already understands
    plain-space-separated tokens) doesn't need to change at all.
    """
    normalized_lines: list[str] = []
    in_triple: str | None = None
    for line_no, raw_line in enumerate(source.splitlines(True), start=1):
        newline = "\n" if raw_line.endswith("\n") else ""
        body = raw_line[:-1] if newline else raw_line
        if in_triple is None and not body.strip():
            normalized_lines.append(raw_line)
            continue

        rebuilt: list[str] = []
        offset = 0
        segments, in_triple = scan_code_segments(body, in_triple)
        for text, is_code in segments:
            if is_code:
                for local_index, character in enumerate(text):
                    if character in (" ", "\t"):
                        kind = "tab" if character == "\t" else "space"
                        _raise_detailed(
                            f"found a literal {kind} character where Rhubarb requires the "
                            f"mandatory space character {MANDATORY_SPACE_CHAR!r} (U+A9C3) instead. "
                            "Ordinary spaces and tabs are not valid Rhubarb syntax outside of "
                            "string literals and comments — replace every structural gap "
                            f"(including indentation) with {MANDATORY_SPACE_CHAR!r}.",
                            line_no,
                            offset + local_index,
                            body,
                        )
                rebuilt.append(text.replace(MANDATORY_SPACE_CHAR, " "))
            else:
                rebuilt.append(text)
            offset += len(text)
        normalized_lines.append("".join(rebuilt) + newline)
    return "".join(normalized_lines)


def migrate_spaces_to_mandatory(source: str) -> str:
    """The inverse of enforce_mandatory_space_character: rewrites old-style
    Rhubarb (plain spaces/tabs between tokens) into the new mandatory-꧃
    style, leaving string literal and comment content untouched. Reverse-
    line-mode input is unreversed first, since migrated output is always
    plain forward Rhubarb. Idempotent — already-migrated source is returned
    unchanged (a stray ꧃ inside a string is never touched either way).
    """
    if uses_reversed_lines(source):
        source = unreversed_source(source, reverse_whole_line=uses_whole_reversed_lines(source))

    migrated_lines: list[str] = []
    in_triple: str | None = None
    for raw_line in source.splitlines(True):
        newline = "\n" if raw_line.endswith("\n") else ""
        body = raw_line[:-1] if newline else raw_line
        if in_triple is None and body.strip() in REVERSE_LINE_MARKERS:
            # Reversing a full-reverse-mode marker happens to produce valid
            # partial-reverse-mode marker text (they're designed as a pair),
            # so a leftover marker here isn't just inert clutter — it would
            # make a later translate() call misread already-forward migrated
            # code as still needing to be unreversed. Migrated output is
            # always plain forward Rhubarb, so drop it outright.
            continue
        if in_triple is None and not body.strip():
            migrated_lines.append(raw_line)
            continue

        rebuilt: list[str] = []
        segments, in_triple = scan_code_segments(body, in_triple)
        for text, is_code in segments:
            if is_code:
                rebuilt.append(re.sub(r"[ \t]", MANDATORY_SPACE_CHAR, text))
            else:
                rebuilt.append(text)
        migrated_lines.append("".join(rebuilt) + newline)
    return "".join(migrated_lines)


def translate(source: str, tokens: TokenSet = DEFAULT_TOKENS) -> str:
    if uses_reversed_lines(source):
        source = unreversed_source(source, reverse_whole_line=uses_whole_reversed_lines(source))
    source = enforce_mandatory_space_character(source)
    return "".join(
        translate_line(line, line_no, tokens) for line_no, line in enumerate(source.splitlines(True), start=1)
    )


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
            # Restored indentation must be the mandatory space character,
            # not a real space — full-reverse mode still has to produce
            # valid (space-free) forward Rhubarb once unreversed.
            lines.append(f"{MANDATORY_SPACE_CHAR * visible_indent}{body[::-1]}{newline}")
            continue
        # .lstrip() alone only recognizes Python's own whitespace set, which
        # does not include the mandatory space character — without this,
        # ꧃-indented lines would have their indent swallowed into the
        # reversal instead of staying in place at the front.
        indent_chars = " \t" + MANDATORY_SPACE_CHAR
        if body.strip() in REVERSE_LINE_MARKERS or body.lstrip(indent_chars).startswith("#"):
            lines.append(line)
            continue
        stripped = body.lstrip(indent_chars)
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
    parser.add_argument(
        "--migrate",
        action="store_true",
        help=(
            "Print the file rewritten into the mandatory-꧃ Rhubarb style "
            "(old plain-space Rhubarb in, new space-free Rhubarb out). "
            "Reverse-line-mode input is unreversed first."
        ),
    )
    args = parser.parse_args()

    if not args.file.exists():
        print(f"Rhubarb could not find {args.file}", file=sys.stderr)
        return 1

    source = args.file.read_text(encoding="utf-8")
    if args.java:
        print(translate_java(source), end="")
        return 0

    if args.migrate:
        print(migrate_spaces_to_mandatory(source), end="")
        return 0

    if args.python:
        try:
            print(translate(source), end="")
        except Exception as error:
            print(f"Rhubarb error: {error}", file=sys.stderr)
            return 1
        return 0

    try:
        run_rhubarb(args.file)
    except Exception as error:
        print(f"Rhubarb error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
