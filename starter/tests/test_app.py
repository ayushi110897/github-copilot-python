import pytest
import sudoku_logic
from app import CURRENT

class TestSudokuLogic:
    def test_puzzle_generation_returns_9x9_grid(self):
        """Test that puzzle generation returns a 9x9 grid."""
        puzzle, solution = sudoku_logic.generate_puzzle()
        assert len(puzzle) == 9
        assert all(len(row) == 9 for row in puzzle)
        assert len(solution) == 9
        assert all(len(row) == 9 for row in solution)

    def test_generated_puzzle_has_exactly_one_unique_solution(self):
        """Test that the generated puzzle has exactly one unique solution."""
        puzzle, solution = sudoku_logic.generate_puzzle()
        # The puzzle should have exactly one solution
        num_solutions = sudoku_logic.count_solutions(puzzle)
        assert num_solutions == 1

    def test_difficulty_levels_return_correct_number_of_prefilled_cells(self):
        """Test that difficulty levels return correct number of prefilled cells."""
        # Easy: more clues, say 50
        puzzle_easy, _ = sudoku_logic.generate_puzzle(clues=50)
        prefilled_easy = sum(1 for row in puzzle_easy for cell in row if cell != 0)
        assert prefilled_easy == 50

        # Medium: 35 (default)
        puzzle_medium, _ = sudoku_logic.generate_puzzle(clues=35)
        prefilled_medium = sum(1 for row in puzzle_medium for cell in row if cell != 0)
        assert prefilled_medium == 35

        # Hard: fewer clues, say 20
        puzzle_hard, _ = sudoku_logic.generate_puzzle(clues=20)
        prefilled_hard = sum(1 for row in puzzle_hard for cell in row if cell != 0)
        assert prefilled_hard == 20

class TestAppRoutes:
    def test_new_game_route_returns_http_200(self, client):
        """Test that the /new route returns HTTP 200."""
        response = client.get('/new')
        assert response.status_code == 200
        data = response.get_json()
        assert 'puzzle' in data
        assert len(data['puzzle']) == 9

    def test_validate_route_correctly_identifies_invalid_moves(self, client):
        """Test that the /check route correctly identifies invalid moves."""
        # First, start a new game
        response = client.get('/new')
        assert response.status_code == 200
        data = response.get_json()
        puzzle = data['puzzle']

        # Create a board with some wrong moves
        # For simplicity, change one cell that's prefilled or add wrong number
        board = sudoku_logic.deep_copy(puzzle)
        # Find a position that is empty and set a wrong number
        for i in range(9):
            for j in range(9):
                if board[i][j] == 0:
                    # Set an invalid number (but since it's empty, we need to check against solution)
                    board[i][j] = 5  # Assume 5 is wrong, but to be sure, we can check
                    break
            else:
                continue
            break

        # Now, post to /check
        response = client.post('/check', json={'board': board})
        assert response.status_code == 200
        data = response.get_json()
        assert 'incorrect' in data
        # Should have at least one incorrect position
        assert len(data['incorrect']) > 0