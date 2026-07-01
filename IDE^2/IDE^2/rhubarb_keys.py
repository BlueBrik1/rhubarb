"""Key-derived, per-user Rhubarb vocabularies.

A single key seeds a deterministic PRNG that generates a private set of
nonsense keyword tokens and method aliases — a completely different
"dialect" of Rhubarb than the public Hungarian/Armenian one, unique to
that key. The grammar (∫, ⟜, ⟪…⟫, the mandatory ꧃ space character) stays
the same; only which word means "if" or ".append" is secret. The cipher
is symmetric: the same key that encodes a file is the only key that can
decode it back, and two different keys never produce the same vocabulary.

The IDE stores exactly one such key at a time. Python -> Rhubarb
mirroring (/mirror) encodes with whatever key is currently loaded;
decoding/running a private-dialect .rhubarb file requires that same key
to be loaded. A different key doesn't fail loudly — it just produces (or
expects) a different, unrelated vocabulary, so it won't round-trip.
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
    """Deterministically derives a private Rhubarb keyword vocabulary from
    a single key. The same key always produces the same vocabulary; a
    different key produces a different one, with no practical way to
    predict it without that exact key. Encoding and decoding both call
    this with the same key, so the cipher is fully symmetric."""
    if not key:
        raise ValueError("A key is required to derive a token set.")

    rng = random.Random(key)
    used: set[str] = set()

    def statement_token() -> tuple[str, ...]:
        return (f"⸘{_unique_word(rng, used)}⸘",)

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
    )
