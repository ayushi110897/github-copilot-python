from flask import Blueprint, request, jsonify
from services.sudoku_service import create_new_game, validate_board, get_hint

game_bp = Blueprint('game', __name__)

@game_bp.route('/api/new-game', methods=['GET'])
def new_game():
    difficulty = request.args.get('difficulty', 'easy')
    if difficulty not in ['easy', 'medium', 'hard']:
        return jsonify({'error': 'Invalid difficulty. Must be easy, medium, or hard'}), 400

    try:
        puzzle, solution = create_new_game(difficulty)
        return jsonify({'puzzle': puzzle, 'solution': solution})
    except Exception as e:
        return jsonify({'error': 'Failed to generate puzzle'}), 500

@game_bp.route('/api/validate', methods=['POST'])
def validate():
    data = request.get_json()
    if not data or 'board' not in data or 'solution' not in data:
        return jsonify({'error': 'Missing board or solution in request body'}), 400

    board = data['board']
    solution = data['solution']

    try:
        incorrect = validate_board(board, solution)
        return jsonify({'incorrect': incorrect})
    except Exception as e:
        return jsonify({'error': 'Validation failed'}), 500

@game_bp.route('/api/hint', methods=['POST'])
def hint():
    data = request.get_json()
    if not data or 'board' not in data or 'solution' not in data:
        return jsonify({'error': 'Missing board or solution in request body'}), 400

    board = data['board']
    solution = data['solution']

    try:
        hint_data = get_hint(board, solution)
        if hint_data:
            row, col, value = hint_data
            return jsonify({'row': row, 'col': col, 'value': value})
        else:
            return jsonify({'message': 'Board is complete'})
    except Exception as e:
        return jsonify({'error': 'Failed to get hint'}), 500