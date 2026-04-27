from typing import List, Tuple, Optional
from sudoku_engine import generate_puzzle, Board

def create_new_game(difficulty: str) -> Tuple[Board, Board]:
    """
    Create a new Sudoku game with the specified difficulty.

    Args:
        difficulty: 'easy', 'medium', or 'hard'

    Returns:
        Tuple of (puzzle_board, solution_board)
    """
    return generate_puzzle(difficulty)

def validate_board(board: Board, solution: Board) -> List[List[int]]:
    """
    Validate a Sudoku board against the solution.

    Args:
        board: The current board state
        solution: The correct solution

    Returns:
        List of [row, col] positions that are incorrect
    """
    incorrect = []
    for i in range(9):
        for j in range(9):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return incorrect

def get_hint(board: Board, solution: Board) -> Optional[Tuple[int, int, int]]:
    """
    Get a hint for the next empty cell.

    Args:
        board: The current board state
        solution: The correct solution

    Returns:
        Tuple of (row, col, value) for the hint, or None if board is complete
    """
    for i in range(9):
        for j in range(9):
            if board[i][j] == 0:  # Empty cell
                return (i, j, solution[i][j])
    return None  # Board is complete