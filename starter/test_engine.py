from sudoku_engine import generate_puzzle

for diff in ["medium", "hard"]:
    puzzle, solution = generate_puzzle(diff)
    prefilled = sum(1 for row in puzzle for cell in row if cell != 0)
    print(f"{diff}: {prefilled} prefilled cells")
