from collections import deque


class Stack:
    def __init__(self):
        self.items = []

    def push(self, value):
        self.items.append(value)

    def pop(self):
        return self.items.pop()

    def peek(self):
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0


def apply_operator(operator, left, right):
    if operator == "+":
        return left + right
    elif operator == "-":
        return left - right
    elif operator == "*":
        return left * right
    else:
        return left / right


def evaluate(tokens):
    stack = Stack()
    for token in tokens:
        if token in ("+", "-", "*", "/"):
            right = stack.pop()
            left = stack.pop()
            stack.push(apply_operator(token, left, right))
        else:
            stack.push(int(token))
    return stack.pop()


def warm_up():
    counter = 0
    for _ in range(3):
        print(f"warming up {counter}")
        counter = counter + 1

    while counter > 0:
        counter = counter - 1
    print(f"cooled down to {counter}")


def main():
    warm_up()
    expression = "3 4 + 2 *".split()
    result = evaluate(expression)
    print(f"Result: {result}")

    label = "all done"
    print(label.upper())

    history = deque()
    for step in range(3):
        history.append(step)
    print(history)


main()
