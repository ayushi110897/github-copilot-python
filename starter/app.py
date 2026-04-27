from flask import Flask, jsonify, render_template, request
from routes.game_routes import game_bp
from services.sudoku_service import create_new_game, validate_board

app = Flask(__name__)

CURRENT = {
    "puzzle": None,
    "solution": None,
}

# Register blueprints
app.register_blueprint(game_bp)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/new")
def legacy_new_game():
    clues = request.args.get("clues", type=int, default=35)
    difficulty_by_clues = {
        35: "easy",
        27: "medium",
        22: "hard",
    }
    difficulty = difficulty_by_clues.get(clues, "easy")
    puzzle, solution = create_new_game(difficulty)
    CURRENT["puzzle"] = puzzle
    CURRENT["solution"] = solution
    return jsonify({"puzzle": puzzle})


@app.route("/check", methods=["POST"])
def legacy_check_solution():
    data = request.get_json() or {}
    board = data.get("board")
    solution = CURRENT.get("solution")

    if solution is None:
        return jsonify({"error": "No game in progress"}), 400

    incorrect = validate_board(board, solution)
    return jsonify({"incorrect": incorrect})


if __name__ == "__main__":
    app.run(debug=True)
