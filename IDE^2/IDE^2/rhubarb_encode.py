"""Python -> Rhubarb encoding: the direction the original compiler never
had (it only ever went Rhubarb -> Python). Walks a Python AST and emits
Rhubarb-shaped source using a given TokenSet, so the result decodes back
correctly via rhubarb.translate(text, tokens=same_tokens).

∫ terminates statements and ꧃ is the only legal structural space no
matter what — those two are shared, fixed grammar. But the assignment
separator and the call delimiters (tokens.assign_sep / tokens.call_open /
tokens.call_close) come from the given TokenSet, not a fixed constant:
the public dialect's TokenSet defaults them to the classic ⟜ and
⟪hívás⟫/⟪vége, while a key-derived private TokenSet (see
rhubarb_keys.derive_token_set) picks different ones per key. Baking ⟜/
⟪hívás⟫/⟪vége in here unconditionally would mean every private-dialect
file used the exact same separator and call brackets regardless of key
— a fixed, public shape that alone is enough to reconstruct the Python
source structurally, without ever knowing the key.

Scope matches the decoder's: import/from-import/import-as, single-target
assignment, class definitions with 0-1 bases, function definitions (any
argument shape, via Python's own unparser), for-in and range(...) repeat
shorthand, while, if/elif/else, try/except (any number of handlers, no
else/finally), return, and expressions/calls with method-alias and
call-delimiter substitution. Anything else falls back to a plain
(space-converted) Python line — still valid, just not keyword-ified —
so encoding never fails outright.
"""

from __future__ import annotations

import ast
from dataclasses import dataclass

import rhubarb

SP = rhubarb.MANDATORY_SPACE_CHAR
TERMINATOR = "∫"
INDENT_WIDTH = 4

_BIN_OPS = {
    ast.Add: "+",
    ast.Sub: "-",
    ast.Mult: "*",
    ast.Div: "/",
    ast.FloorDiv: "//",
    ast.Mod: "%",
    ast.Pow: "**",
    ast.LShift: "<<",
    ast.RShift: ">>",
    ast.BitOr: "|",
    ast.BitXor: "^",
    ast.BitAnd: "&",
    ast.MatMult: "@",
}
_CMP_OPS = {
    ast.Eq: "==",
    ast.NotEq: "!=",
    ast.Lt: "<",
    ast.LtE: "<=",
    ast.Gt: ">",
    ast.GtE: ">=",
    ast.Is: "is",
    ast.IsNot: f"is{SP}not",
    ast.In: "in",
    ast.NotIn: f"not{SP}in",
}
_BOOL_OPS = {ast.And: "and", ast.Or: "or"}
_UNARY_OPS = {ast.UAdd: "+", ast.USub: "-", ast.Not: "not", ast.Invert: "~"}


class EncodeError(Exception):
    """Raised when the given Python source can't be parsed at all."""


@dataclass(frozen=True)
class _Ctx:
    """Bundles the per-run bits that expression encoding needs beyond the
    AST node itself: the method-alias reverse lookup, and the TokenSet's
    own call delimiters (so a nested call anywhere in an expression tree
    still uses this dialect's call brackets, not a fixed constant)."""

    aliases: dict[str, str]
    call_open: str
    call_close: str


def encode_python_to_rhubarb(source: str, tokens: rhubarb.TokenSet) -> str:
    try:
        tree = ast.parse(source)
    except SyntaxError as error:
        raise EncodeError(f"Not valid Python: {error}") from error

    aliases = {python_name: alias for alias, python_name in tokens.method_aliases.items()}
    ctx = _Ctx(aliases=aliases, call_open=tokens.call_open, call_close=tokens.call_close)
    lines: list[str] = []
    _encode_body(tree.body, 0, tokens, ctx, lines)
    return "\n".join(lines) + ("\n" if lines else "")


def _indent(depth: int) -> str:
    return SP * (INDENT_WIDTH * depth)


def _spaces_only(text: str) -> str:
    """Converts real spaces/tabs to ꧃ in an already-valid chunk of Python
    text (e.g. a function signature) without touching string content."""
    segments, _ = rhubarb.scan_code_segments(text)
    pieces = []
    for chunk, is_code in segments:
        pieces.append(chunk.replace(" ", SP).replace("\t", SP) if is_code else chunk)
    return "".join(pieces)


def _encode_body(stmts: list[ast.stmt], depth: int, tokens: rhubarb.TokenSet, ctx: _Ctx, lines: list[str]) -> None:
    if not stmts:
        lines.append(f"{_indent(depth)}pass")
        return
    for stmt in stmts:
        _encode_stmt(stmt, depth, tokens, ctx, lines)


def _encode_stmt(stmt: ast.stmt, depth: int, tokens: rhubarb.TokenSet, ctx: _Ctx, lines: list[str]) -> None:
    indent = _indent(depth)
    kw = tokens

    if isinstance(stmt, ast.Import):
        for alias in stmt.names:
            module = alias.name
            if alias.asname:
                lines.append(f"{indent}{kw.import_as[0]}{SP}{module}{SP}{kw.assign_sep}{SP}{alias.asname}{SP}{TERMINATOR}")
            else:
                lines.append(f"{indent}{kw.import_[0]}{SP}{module}{SP}{TERMINATOR}")
        return

    if isinstance(stmt, ast.ImportFrom):
        module = "." * stmt.level + (stmt.module or "")
        names = f",{SP}".join(
            f"{alias.name}{SP}as{SP}{alias.asname}" if alias.asname else alias.name for alias in stmt.names
        )
        lines.append(f"{indent}{kw.import_[0]}{SP}{names}{SP}{kw.assign_sep}{SP}{module}{SP}{TERMINATOR}")
        return

    if isinstance(stmt, ast.Assign) and len(stmt.targets) == 1:
        target_text = _encode_expr(stmt.targets[0], ctx)
        value_text = _encode_expr(stmt.value, ctx)
        lines.append(f"{indent}{kw.assign[0]}{SP}{target_text}{SP}{kw.assign_sep}{SP}{value_text}{SP}{TERMINATOR}")
        return

    if isinstance(stmt, ast.ClassDef):
        name = stmt.name
        if stmt.bases:
            base_text = _encode_expr(stmt.bases[0], ctx)
            lines.append(f"{indent}{kw.class_[0]}{SP}{name}{SP}{kw.assign_sep}{SP}{base_text}{SP}{TERMINATOR}")
        else:
            lines.append(f"{indent}{kw.class_[0]}{SP}{name}{SP}{TERMINATOR}")
        _encode_body(stmt.body, depth + 1, tokens, ctx, lines)
        return

    if isinstance(stmt, (ast.FunctionDef, ast.AsyncFunctionDef)):
        args_text = _spaces_only(_unparse_args(stmt.args))
        header = f"{indent}{kw.function[0]}{SP}{stmt.name}{SP}{kw.call_open}{SP}{args_text}{SP}{kw.call_close}"
        if stmt.returns is not None:
            header += f"{SP}->{SP}{_encode_expr(stmt.returns, ctx)}"
        lines.append(f"{header}{SP}{TERMINATOR}")
        _encode_body(stmt.body, depth + 1, tokens, ctx, lines)
        return

    if isinstance(stmt, ast.For):
        target_text = _encode_expr(stmt.target, ctx)
        is_simple_repeat = (
            isinstance(stmt.target, ast.Name)
            and stmt.target.id == "_"
            and isinstance(stmt.iter, ast.Call)
            and isinstance(stmt.iter.func, ast.Name)
            and stmt.iter.func.id == "range"
            and len(stmt.iter.args) == 1
            and not stmt.iter.keywords
        )
        if is_simple_repeat:
            count_text = _encode_expr(stmt.iter.args[0], ctx)
            lines.append(f"{indent}{kw.repeat[0]}{SP}{count_text}{SP}{TERMINATOR}")
        else:
            iter_text = _encode_expr(stmt.iter, ctx)
            lines.append(f"{indent}{kw.for_[0]}{SP}{target_text}{SP}{kw.assign_sep}{SP}{iter_text}{SP}{TERMINATOR}")
        _encode_body(stmt.body, depth + 1, tokens, ctx, lines)
        return

    if isinstance(stmt, ast.While):
        cond_text = _encode_expr(stmt.test, ctx)
        lines.append(f"{indent}{kw.while_[0]}{SP}{cond_text}{SP}{TERMINATOR}")
        _encode_body(stmt.body, depth + 1, tokens, ctx, lines)
        return

    if isinstance(stmt, ast.If):
        cond_text = _encode_expr(stmt.test, ctx)
        lines.append(f"{indent}{kw.if_[0]}{SP}{cond_text}{SP}{TERMINATOR}")
        _encode_body(stmt.body, depth + 1, tokens, ctx, lines)
        _encode_orelse_chain(stmt.orelse, depth, tokens, ctx, lines)
        return

    if isinstance(stmt, ast.Try):
        lines.append(f"{indent}{kw.try_[0]}{SP}{TERMINATOR}")
        _encode_body(stmt.body, depth + 1, tokens, ctx, lines)
        for handler in stmt.handlers:
            if handler.type is not None:
                type_text = _encode_expr(handler.type, ctx)
                if handler.name:
                    type_text += f"{SP}as{SP}{handler.name}"
                lines.append(f"{indent}{kw.except_[0]}{SP}{type_text}{SP}{TERMINATOR}")
            else:
                lines.append(f"{indent}{kw.except_[0]}{SP}{TERMINATOR}")
            _encode_body(handler.body, depth + 1, tokens, ctx, lines)
        return

    if isinstance(stmt, ast.Return):
        value_text = _encode_expr(stmt.value, ctx) if stmt.value is not None else ""
        lines.append(f"{indent}{kw.return_[0]}{SP}{value_text}{SP}{TERMINATOR}")
        return

    if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Call):
        call = stmt.value
        if isinstance(call.func, ast.Name) and call.func.id == "print" and not call.keywords:
            args_text = f",{SP}".join(_encode_expr(arg, ctx) for arg in call.args)
            lines.append(f"{indent}{kw.print_[0]}{SP}{args_text}{SP}{TERMINATOR}")
            return
        lines.append(f"{indent}{_encode_expr(call, ctx)}{SP}{TERMINATOR}")
        return

    if isinstance(stmt, ast.Pass):
        lines.append(f"{indent}pass")
        return
    if isinstance(stmt, ast.Break):
        lines.append(f"{indent}break")
        return
    if isinstance(stmt, ast.Continue):
        lines.append(f"{indent}continue")
        return

    # Fallback for anything not explicitly handled above (AugAssign,
    # AnnAssign, With, chained assignment, decorators, ...): still valid
    # Python, just not keyword-ified, matching the decoder's own tolerance
    # for plain Python fallback lines.
    lines.append(f"{indent}{_spaces_only(ast.unparse(stmt))}")


def _encode_orelse_chain(orelse: list[ast.stmt], depth: int, tokens: rhubarb.TokenSet, ctx: _Ctx, lines: list[str]) -> None:
    indent = _indent(depth)
    if not orelse:
        return
    if len(orelse) == 1 and isinstance(orelse[0], ast.If):
        elif_stmt = orelse[0]
        cond_text = _encode_expr(elif_stmt.test, ctx)
        lines.append(f"{indent}{tokens.elif_[0]}{SP}{cond_text}{SP}{TERMINATOR}")
        _encode_body(elif_stmt.body, depth + 1, tokens, ctx, lines)
        _encode_orelse_chain(elif_stmt.orelse, depth, tokens, ctx, lines)
        return
    lines.append(f"{indent}{tokens.else_[0]}{SP}{TERMINATOR}")
    _encode_body(orelse, depth + 1, tokens, ctx, lines)


def _unparse_args(args: ast.arguments) -> str:
    full = ast.unparse(ast.Lambda(args=args, body=ast.Constant(value=None)))
    return full[len("lambda") : -len(": None")].strip()


def _encode_call(node: ast.Call, ctx: _Ctx) -> str:
    func_text = _encode_expr(node.func, ctx)
    parts = [_encode_expr(arg, ctx) for arg in node.args]
    parts.extend(f"{kw.arg}={_encode_expr(kw.value, ctx)}" for kw in node.keywords if kw.arg)
    parts.extend(f"**{_encode_expr(kw.value, ctx)}" for kw in node.keywords if kw.arg is None)
    args_text = f",{SP}".join(parts)
    return f"{func_text}{ctx.call_open}{args_text}{ctx.call_close}"


def _encode_expr(node: ast.expr | None, ctx: _Ctx, top: bool = True) -> str:
    if node is None:
        return ""

    if isinstance(node, ast.Constant):
        return repr(node.value)

    if isinstance(node, ast.Name):
        return node.id

    if isinstance(node, ast.Attribute):
        base_text = _encode_expr(node.value, ctx, top=False)
        alias = ctx.aliases.get(f".{node.attr}")
        return f"{base_text}{alias if alias else f'.{node.attr}'}"

    if isinstance(node, ast.Call):
        return _encode_call(node, ctx)

    if isinstance(node, ast.Subscript):
        base_text = _encode_expr(node.value, ctx, top=False)
        index_text = _encode_expr(node.slice, ctx)
        return f"{base_text}[{index_text}]"

    if isinstance(node, ast.Slice):
        lower = _encode_expr(node.lower, ctx) if node.lower else ""
        upper = _encode_expr(node.upper, ctx) if node.upper else ""
        step = _encode_expr(node.step, ctx) if node.step else ""
        return f"{lower}:{upper}" + (f":{step}" if step else "")

    if isinstance(node, ast.BinOp):
        op = _BIN_OPS.get(type(node.op))
        if op is None:
            return _spaces_only(ast.unparse(node))
        text = f"{_encode_expr(node.left, ctx, top=False)}{SP}{op}{SP}{_encode_expr(node.right, ctx, top=False)}"
        return text if top else f"({text})"

    if isinstance(node, ast.BoolOp):
        op = _BOOL_OPS.get(type(node.op), "and")
        joined = f"{SP}{op}{SP}".join(_encode_expr(value, ctx, top=False) for value in node.values)
        return joined if top else f"({joined})"

    if isinstance(node, ast.UnaryOp):
        op = _UNARY_OPS.get(type(node.op), "")
        operand = _encode_expr(node.operand, ctx, top=False)
        sep = SP if op == "not" else ""
        text = f"{op}{sep}{operand}"
        return text if top else f"({text})"

    if isinstance(node, ast.Compare):
        pieces = [_encode_expr(node.left, ctx, top=False)]
        for op, comparator in zip(node.ops, node.comparators):
            op_text = _CMP_OPS.get(type(op), "==")
            pieces.append(op_text)
            pieces.append(_encode_expr(comparator, ctx, top=False))
        text = f"{SP}".join(pieces)
        return text if top else f"({text})"

    if isinstance(node, ast.IfExp):
        body_text = _encode_expr(node.body, ctx, top=False)
        cond_text = _encode_expr(node.test, ctx, top=False)
        else_text = _encode_expr(node.orelse, ctx, top=False)
        text = f"{body_text}{SP}if{SP}{cond_text}{SP}else{SP}{else_text}"
        return text if top else f"({text})"

    if isinstance(node, ast.Lambda):
        args_text = _spaces_only(_unparse_args(node.args))
        body_text = _encode_expr(node.body, ctx, top=False)
        text = f"lambda{SP}{args_text}:{SP}{body_text}" if args_text else f"lambda:{SP}{body_text}"
        return text if top else f"({text})"

    if isinstance(node, ast.List):
        return f"[{f',{SP}'.join(_encode_expr(e, ctx) for e in node.elts)}]"

    if isinstance(node, ast.Tuple):
        inner = f",{SP}".join(_encode_expr(e, ctx) for e in node.elts)
        if len(node.elts) == 1:
            inner += ","
        return f"({inner})"

    if isinstance(node, ast.Set):
        return f"{{{f',{SP}'.join(_encode_expr(e, ctx) for e in node.elts)}}}"

    if isinstance(node, ast.Dict):
        parts = []
        for key, value in zip(node.keys, node.values):
            if key is None:
                parts.append(f"**{_encode_expr(value, ctx)}")
            else:
                parts.append(f"{_encode_expr(key, ctx)}:{SP}{_encode_expr(value, ctx)}")
        return f"{{{f',{SP}'.join(parts)}}}"

    if isinstance(node, ast.Starred):
        return f"*{_encode_expr(node.value, ctx, top=False)}"

    if isinstance(node, ast.JoinedStr):
        pieces = []
        for value in node.values:
            if isinstance(value, ast.Constant):
                pieces.append(str(value.value))
            elif isinstance(value, ast.FormattedValue):
                inner = _encode_expr(value.value, ctx)
                pieces.append("{" + inner + "}")
        body = "".join(pieces).replace('"', '\\"')
        return f'f"{body}"'

    if isinstance(node, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
        # Comprehensions are rare enough in typical scripts, and their
        # internal scoping/`for`/`if` clauses don't map onto any Rhubarb
        # keyword token anyway — fall back to plain (space-converted)
        # Python, which the decoder passes through untouched.
        return _spaces_only(ast.unparse(node))

    # Anything else (walrus, yield, await, comparisons with rare ops, ...):
    # same fallback.
    return _spaces_only(ast.unparse(node))
