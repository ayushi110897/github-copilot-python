import random
from typing import List, Tuple, Literal

SIZE = 9
EMPTY = 0
Board = List[List[int]]


def is_safe(board: Board, row: int, col: int, num: int) -> bool:
    """
    Check if it's safe to place a number in a specific cell.

    Args:
        board: The Sudoku board.
        row: Row index (0-8).
        col: Column index (0-8).
        num: Number to place (1-9).

    Returns:
        True if safe, False otherwise.
    """
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


def fill_board(board: Board) -> bool:
    """
    Fill the board using backtracking algorithm.

    Args:
        board: The Sudoku board to fill (modified in place).

    Returns:
        True if successfully filled, False otherwise.
    """
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                numbers = list(range(1, SIZE + 1))
                random.shuffle(numbers)
                for num in numbers:
                    if is_safe(board, row, col, num):
                        board[row][col] = num
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def generate_complete_board() -> Board:
    """
    Generate a complete, valid Sudoku board.

    Returns:
        A 9x9 board filled with numbers 1-9.
    """
    board = [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]
    fill_board(board)
    return board


def remove_cells(board: Board, num_prefilled: int) -> Board:
    """
    Remove cells from a complete board to create a puzzle.

    Args:
        board: The complete Sudoku board.
        num_prefilled: Number of cells to keep filled.

    Returns:
        A puzzle board with some cells removed.
    """
    puzzle = [row[:] for row in board]
    cells_to_remove = SIZE * SIZE - num_prefilled
    while cells_to_remove > 0:
        row = random.randint(0, SIZE - 1)
        col = random.randint(0, SIZE - 1)
        if puzzle[row][col] != EMPTY:
            puzzle[row][col] = EMPTY
            cells_to_remove -= 1
    return puzzle


def count_solutions(board: Board) -> int:
    """
    Count the number of solutions for a Sudoku puzzle.

    Args:
        board: The Sudoku puzzle board.

    Returns:
        Number of unique solutions (0, 1, or more).
    """

    def is_valid(b: Board, row: int, col: int, num: int) -> bool:
        # Check row
        for x in range(SIZE):
            if b[row][x] == num:
                return False
        # Check column
        for x in range(SIZE):
            if b[x][col] == num:
                return False
        # Check 3x3 box
        start_row = row - row % 3
        start_col = col - col % 3
        for i in range(3):
            for j in range(3):
                if b[start_row + i][start_col + j] == num:
                    return False
        return True

    solutions = [0]  # Use list to modify in nested function

    def solve(b: Board) -> None:
        for row in range(SIZE):
            for col in range(SIZE):
                if b[row][col] == EMPTY:
                    for num in range(1, SIZE + 1):
                        if is_valid(b, row, col, num):
                            b[row][col] = num
                            solve(b)
                            b[row][col] = EMPTY
                            if solutions[0] > 1:  # Early exit if more than one solution
                                return
                    return
        solutions[0] += 1

    # Work on a copy to avoid modifying the original
    board_copy = [row[:] for row in board]
    solve(board_copy)
    return solutions[0]


def has_unique_solution(board: Board) -> bool:
    """
    Check if a Sudoku puzzle has exactly one unique solution.

    Args:
        board: The Sudoku puzzle board.

    Returns:
        True if exactly one solution, False otherwise.
    """
    return count_solutions(board) == 1


def carve_unique_puzzle(solution: Board, clues: int) -> Board:
    """
    Remove cells one at a time while keeping a unique solution.

    Args:
        solution: A complete solved Sudoku board.
        clues: Number of filled cells to keep.

    Returns:
        A puzzle board with exactly ``clues`` prefilled cells if possible.
        If not enough cells can be removed while preserving uniqueness, returns
        a puzzle with more than ``clues`` cells filled.
    """
    puzzle = [row[:] for row in solution]
    positions = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(positions)

    filled_cells = SIZE * SIZE
    for row, col in positions:
        if filled_cells <= clues:
            break

        backup = puzzle[row][col]
        puzzle[row][col] = EMPTY

        if has_unique_solution(puzzle):
            filled_cells -= 1
        else:
            puzzle[row][col] = backup

    return puzzle


def generate_puzzle(
    difficulty: Literal["easy", "medium", "hard"],
) -> Tuple[Board, Board]:
    """
    Generate a Sudoku puzzle with specified difficulty.

    Args:
        difficulty: Difficulty level ('easy', 'medium', 'hard').

    Returns:
        Tuple of (puzzle_board, solution_board).
    """
    clues = {"easy": 35, "medium": 27, "hard": 22}[difficulty]
    max_attempts = 40

    for _ in range(max_attempts):
        solution = generate_complete_board()
        puzzle = carve_unique_puzzle(solution, clues)
        prefilled = sum(1 for row in puzzle for cell in row if cell != EMPTY)
        if prefilled == clues and has_unique_solution(puzzle):
            return puzzle, solution

    # Fallback: return the closest puzzle generated in the last attempt.
    # This avoids hanging the API when a strict target is expensive to reach.
    return puzzle, solution
