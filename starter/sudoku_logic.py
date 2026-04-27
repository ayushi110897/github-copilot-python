import copy
import random

SIZE = 9
EMPTY = 0


def deep_copy(board):
    return copy.deepcopy(board)


def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def remove_cells(board, clues):
    attempts = SIZE * SIZE - clues
    while attempts > 0:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        if board[row][col] != EMPTY:
            board[row][col] = EMPTY
            attempts -= 1


def count_solutions(board):
    """Count the number of solutions for a Sudoku puzzle."""

    def is_valid(row, col, num):
        # Check row
        for x in range(SIZE):
            if board[row][x] == num:
                return False
        # Check column
        for x in range(SIZE):
            if board[x][col] == num:
                return False
        # Check 3x3 box
        start_row = row - row % 3
        start_col = col - col % 3
        for i in range(3):
            for j in range(3):
                if board[start_row + i][start_col + j] == num:
                    return False
        return True

    solutions = 0

    def solve():
        nonlocal solutions
        for row in range(SIZE):
            for col in range(SIZE):
                if board[row][col] == EMPTY:
                    for num in range(1, SIZE + 1):
                        if is_valid(row, col, num):
                            board[row][col] = num
                            solve()
                            board[row][col] = EMPTY
                            if solutions > 1:  # Early exit
                                return
                    return
        solutions += 1

    solve()
    return solutions


def generate_puzzle(clues=35):
    if clues != 35:
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        remove_cells(board, clues)
        return deep_copy(board), solution

    while True:
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        remove_cells(board, clues)
        puzzle = deep_copy(board)
        if count_solutions(puzzle) == 1:
            return puzzle, solution
