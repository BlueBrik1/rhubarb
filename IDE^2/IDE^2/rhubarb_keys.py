"""Key-derived, per-user Rhubarb vocabularies.

A single key seeds a deterministic PRNG that generates a private set of
nonsense keyword tokens and method aliases — a completely different
"dialect" of Rhubarb than the public Hungarian/Armenian one, unique to
that key. The cipher is symmetric: the same key that encodes a file is
the only key that can decode it back, and two different keys never
produce the same vocabulary.

Unlike the public dialect, the private dialect's *grammar symbols* are
also key-derived, not fixed: the assignment separator (public: ⟜), the
call-open/call-close delimiters (public: ⟪hívás⟫ / ⟪vége), and the
paired punctuation that wraps each statement keyword (public: ⸘…⸘) are
all drawn from this key's PRNG, from pools distinct from the public
symbols. This closes a real hole: previously every private-dialect file
reused those exact public grammar symbols regardless of key, so the
*shape* of a statement (does it take an argument? does it use ⟜? is it
followed by ⟪…⟫?) was identical and public across every key — enough on
its own to work out which nonsense word meant "if" or "class" by pure
structural pattern-matching, without ever knowing the key. Randomizing
the grammar symbols per key means there is no single fixed formula left
that reverses every private-dialect file; recovering one now requires
the actual key, not just a copy of this source file.

The IDE stores exactly one such key at a time. Python -> Rhubarb
mirroring (/mirror) encodes with whatever key is currently loaded;
decoding/running a private-dialect .rhubarb file requires that same key
to be loaded. A different key doesn't fail loudly — it just produces (or
expects) a different, unrelated vocabulary and grammar, so it won't
round-trip.
"""

from __future__ import annotations

import random
import secrets
import string

import rhubarb

KEY_ALPHABET = string.ascii_uppercase + string.digits
KEY_LENGTH = 12

CONSONANTS = "bcdfghjklmnpqrstvwxz"
VOWELS = "aeiou"

# Candidate grammar symbols for the private dialect, deliberately disjoint
# from the public/legacy ones (⟜, ⟪⟫, ⸘, ∫, ꧃) so a private-dialect file
# never accidentally looks like it's using the fixed public grammar. Which
# entry each key picks is itself determined by that key's PRNG draw, so the
# assignment separator, call brackets, and keyword-wrap punctuation differ
# from one private dialect to the next.
ASSIGN_SEP_POOL = (
    "↦", "↠", "⇀", "⇛", "⇒", "⇉", "⇶", "⇸", "⇻", "⇾",
    "⟶", "⟹", "⟼", "⟾", "⤇", "⤑", "⤳", "⥅", "⥱", "⥴",
)

CALL_BRACKET_POOL = (
    ("⟦", "⟧"), ("⁅", "⁆"), ("⟬", "⟭"), ("⦗", "⦘"), ("⟮", "⟯"),
    ("⦃", "⦄"), ("〖", "〗"), ("『", "』"), ("⌈", "⌉"), ("⌊", "⌋"),
    ("⸢", "⸣"), ("⸤", "⸥"), ("⦉", "⦊"), ("⦋", "⦌"), ("⧘", "⧙"),
    ("〔", "〕"), ("〘", "〙"), ("⦇", "⦈"), ("⸦", "⸧"), ("⁽", "⁾"),
)

KEYWORD_WRAP_POOL = (
    ("⌜", "⌝"), ("⌞", "⌟"), ("⟅", "⟆"), ("⦑", "⦒"), ("‹", "›"),
    ("«", "»"), ("⸨", "⸩"), ("﴾", "﴿"), ("⟨", "⟩"), ("〈", "〉"),
    ("《", "》"), ("「", "」"), ("⌌", "⌍"), ("⌎", "⌏"), ("⦕", "⦖"),
    ("⦓", "⦔"), ("⸜", "⸝"), ("⸌", "⸍"), ("⧼", "⧽"), ("⧚", "⧛"),
)

METHOD_NAMES = (
    "upper",
    "lower",
    "split",
    "join",
    "startswith",
    "endswith",
    "strip",
    "rstrip",
    "lstrip",
    "replace",
    "find",
    "count",
    "append",
    "extend",
    "insert",
    "pop",
    "sort",
    "copy",
)


def generate_key() -> str:
    return "".join(secrets.choice(KEY_ALPHABET) for _ in range(KEY_LENGTH))


def _make_word(rng: random.Random, min_syllables: int, max_syllables: int) -> str:
    syllable_count = rng.randint(min_syllables, max_syllables)
    parts = [rng.choice(CONSONANTS) + rng.choice(VOWELS) for _ in range(syllable_count)]
    return "".join(parts)


def _unique_word(rng: random.Random, used: set[str], min_syllables: int = 2, max_syllables: int = 3) -> str:
    while True:
        word = _make_word(rng, min_syllables, max_syllables)
        if word not in used:
            used.add(word)
            return word


def derive_token_set(key: str) -> rhubarb.TokenSet:
    """Deterministically derives a private Rhubarb vocabulary *and* grammar
    from a single key. The same key always produces the same result; a
    different key produces a different one, with no practical way to
    predict it without that exact key. Encoding and decoding both call
    this with the same key, so the cipher is fully symmetric.

    Critically, the grammar symbols (the keyword-wrap punctuation, the
    assignment separator, and the call delimiters) are drawn from this
    key's PRNG too, from pools disjoint from the public dialect's fixed
    ⸘…⸘ / ⟜ / ⟪…⟫. If they weren't, every private-dialect file would share
    the exact same argument shapes and delimiters no matter the key,
    which hands over the whole grammar skeleton for free — enough to
    reconstruct the Python source by structural pattern-matching alone,
    without ever guessing the key.
    """
    if not key:
        raise ValueError("A key is required to derive a token set.")

    rng = random.Random(key)
    used: set[str] = set()

    wrap_open, wrap_close = rng.choice(KEYWORD_WRAP_POOL)
    assign_sep = rng.choice(ASSIGN_SEP_POOL)
    bracket_open, bracket_close = rng.choice(CALL_BRACKET_POOL)
    call_open = f"{bracket_open}{_unique_word(rng, used)}{bracket_close}"
    call_close = f"{bracket_open}{_unique_word(rng, used)}{bracket_close}"

    def statement_token() -> tuple[str, ...]:
        return (f"{wrap_open}{_unique_word(rng, used)}{wrap_close}",)

    method_aliases: dict[str, str] = {}
    for python_name in METHOD_NAMES:
        alias_word = _unique_word(rng, used)
        method_aliases[f".{alias_word}"] = f".{python_name}"

    return rhubarb.TokenSet(
        import_=statement_token(),
        import_as=statement_token(),
        assign=statement_token(),
        class_=(_unique_word(rng, used, 4, 6).capitalize(),),
        function=(_unique_word(rng, used, 4, 6).capitalize(),),
        for_=statement_token(),
        repeat=statement_token(),
        while_=statement_token(),
        if_=statement_token(),
        elif_=statement_token(),
        else_=statement_token(),
        try_=statement_token(),
        except_=statement_token(),
        return_=statement_token(),
        print_=statement_token(),
        method_aliases=method_aliases,
        assign_sep=assign_sep,
        call_open=call_open,
        call_close=call_close,
    )
