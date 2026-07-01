def clean_words(text):
    lowered = text.lower()
    stripped = lowered.strip()
    return stripped.split()


def count_word(words, target):
    return words.count(target)


def longest_word(words):
    longest = ""
    for word in words:
        if len(word) > len(longest):
            longest = word
    return longest


def try_parse_number(word):
    try:
        return int(word)
    except ValueError:
        return None
    except TypeError:
        return None


def summarize(text):
    words = clean_words(text)
    joined = "-".join(words)
    print(f"joined: {joined}")

    replaced = text.replace("rhubarb", "PLANT")
    print(replaced)

    if replaced.startswith("The"):
        print("starts with The")
    elif replaced.endswith("."):
        print("ends with a period")
    else:
        print("no special ending")

    position = text.find("rhubarb")
    if position == -1:
        print("rhubarb not found")
    else:
        print(f"found rhubarb at {position}")

    numbers = []
    for word in words:
        parsed = try_parse_number(word)
        if parsed is not None:
            numbers.append(parsed)

    print(f"longest word: {longest_word(words)}")
    print(f"rhubarb count: {count_word(words, 'rhubarb')}")
    print(f"numbers found: {numbers}")


sample = "The rhubarb 3 patch has 12 stalks of rhubarb."
summarize(sample)
