/**
 * Sudoku Game Client
 * Handles board rendering, user input, and game logic
 */

const SIZE = 9;
const STORAGE_KEY = 'sudoku_top10';
let puzzle = [];
let solution = [];
let hintsUsed = 0;
let currentDifficulty = 'medium';
let completionRecorded = false;
let selectedDigit = null;

// Timer variables
let timerInterval = null;
let timerSeconds = 0;

/**
 * Format seconds into MM:SS format
 * @param {number} seconds - Total seconds elapsed
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Update the timer display
 */
function updateTimer() {
  timerSeconds++;
  const timerEl = document.getElementById('timer');
  if (timerEl) {
    timerEl.textContent = formatTime(timerSeconds);
  }
}

/**
 * Start the timer
 */
function startTimer() {
  stopTimer();
  timerSeconds = 0;
  const timerEl = document.getElementById('timer');
  if (timerEl) {
    timerEl.textContent = '00:00';
  }
  timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Stop the timer
 */
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Read persisted leaderboard entries.
 * @returns {Array<{name: string, time: number, difficulty: string, hintsUsed: number, date: string}>} Scores.
 */
function getStoredScores() {
  try {
    const rawScores = localStorage.getItem(STORAGE_KEY);
    if (!rawScores) {
      return [];
    }

    const parsedScores = JSON.parse(rawScores);
    return Array.isArray(parsedScores) ? parsedScores : [];
  } catch (error) {
    return [];
  }
}

/**
 * Persist leaderboard entries.
 * @param {Array<{name: string, time: number, difficulty: string, hintsUsed: number, date: string}>} scores - Scores to save.
 */
function setStoredScores(scores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

/**
 * Render the Top 10 leaderboard table.
 */
function renderLeaderboard() {
  const leaderboardBody = document.getElementById('leaderboard-body');
  if (!leaderboardBody) {
    return;
  }

  const scores = getStoredScores();
  if (scores.length === 0) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="6" class="leaderboard-empty">No scores yet. Solve a puzzle to create the first record.</td>
      </tr>
    `;
    return;
  }

  leaderboardBody.innerHTML = scores.map((score, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${score.name}</td>
      <td>${formatTime(score.time)}</td>
      <td>${score.difficulty}</td>
      <td>${score.hintsUsed}</td>
      <td>${score.date}</td>
    </tr>
  `).join('');
}

/**
 * Save a completed game to the Top 10 leaderboard.
 */
function saveCompletedGame() {
  if (completionRecorded) {
    return;
  }

  const enteredName = window.prompt('Puzzle complete! Enter your name for the Top 10 scoreboard:', 'Player');
  const playerName = enteredName && enteredName.trim() ? enteredName.trim().slice(0, 20) : 'Player';
  const scores = getStoredScores();
  const nextScore = {
    name: playerName,
    time: timerSeconds,
    difficulty: currentDifficulty,
    hintsUsed,
    date: new Date().toLocaleDateString()
  };

  scores.push(nextScore);
  scores.sort((left, right) => left.time - right.time);
  setStoredScores(scores.slice(0, 10));
  completionRecorded = true;
  renderLeaderboard();
}

/**
 * Initialize dark mode from localStorage and system preference
 */
function initializeDarkMode() {
  const body = document.body;
  const savedMode = localStorage.getItem('sudoku-theme');

  if (savedMode) {
    if (savedMode === 'dark') {
      body.classList.add('dark');
      body.classList.remove('light');
    } else if (savedMode === 'light') {
      body.classList.add('light');
      body.classList.remove('dark');
    }
  } else {
    // If no saved preference, use system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      body.classList.add('dark');
      body.classList.remove('light');
    }
  }
  updateDarkModeButtonIcon();
}

/**
 * Update the dark mode toggle button icon
 */
function updateDarkModeButtonIcon() {
  const btn = document.getElementById('dark-mode-toggle');
  if (btn) {
    const icon = btn.querySelector('.icon');
    const isDark = document.body.classList.contains('dark');
    icon.textContent = isDark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.contains('dark');

  if (isDark) {
    body.classList.remove('dark');
    body.classList.add('light');
    localStorage.setItem('sudoku-theme', 'light');
  } else {
    body.classList.add('dark');
    body.classList.remove('light');
    localStorage.setItem('sudoku-theme', 'dark');
  }

  updateDarkModeButtonIcon();
}

/**
 * Count placed digits on the current board.
 * @returns {Record<number, number>} Counts keyed by digit.
 */
function getDigitCounts() {
  const board = getBoardFromInputs();
  const counts = {};

  for (let digit = 1; digit <= SIZE; digit++) {
    counts[digit] = 0;
  }

  board.forEach((row) => {
    row.forEach((value) => {
      if (value >= 1 && value <= SIZE) {
        counts[value] += 1;
      }
    });
  });

  return counts;
}

/**
 * Update highlighted cells for the selected tracker digit.
 */
function updateDigitHighlights() {
  const inputs = document.querySelectorAll('.sudoku-cell');

  inputs.forEach((input) => {
    const cellValue = input.value ? parseInt(input.value, 10) : 0;
    input.dataset.highlighted = selectedDigit !== null && cellValue === selectedDigit ? 'true' : 'false';
  });
}

/**
 * Render the number tracker based on current board state.
 */
function renderNumberTracker() {
  const tracker = document.getElementById('number-tracker');
  if (!tracker) {
    return;
  }

  const counts = getDigitCounts();
  tracker.innerHTML = Array.from({ length: SIZE }, (_, index) => {
    const digit = index + 1;
    const remaining = SIZE - counts[digit];
    const selectedClass = selectedDigit === digit ? ' is-selected' : '';
    const completeClass = remaining === 0 ? ' is-complete' : '';
    return `
      <button type="button" class="tracker-digit${selectedClass}${completeClass}" data-digit="${digit}" aria-pressed="${selectedDigit === digit}" aria-label="Digit ${digit}, ${remaining} remaining on the board">
        <span class="tracker-digit__value">${digit}</span>
        <span class="tracker-digit__remaining">${remaining} left</span>
      </button>
    `;
  }).join('');

  tracker.querySelectorAll('.tracker-digit').forEach((button) => {
    button.addEventListener('click', () => {
      const digit = parseInt(button.dataset.digit, 10);
      selectedDigit = selectedDigit === digit ? null : digit;
      renderNumberTracker();
      updateDigitHighlights();
    });
  });
}

/**
 * Refresh tracker counts and selected digit highlights.
 */
function refreshBoardInsights() {
  renderNumberTracker();
  updateDigitHighlights();
}

/**
 * Update validation state for a single input.
 * @param {HTMLInputElement} input - Cell input element.
 */
function updateCellState(input) {
  const row = parseInt(input.dataset.row, 10);
  const col = parseInt(input.dataset.col, 10);
  const value = input.value ? parseInt(input.value, 10) : 0;
  const readonlyLabel = input.dataset.prefilled === 'true' ? ', read only' : '';

  if (value === 0) {
    input.dataset.invalid = 'false';
    input.dataset.validated = 'none';
    input.dataset.hint = 'false';
    input.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}, empty${readonlyLabel}`);
    return;
  }

  const correct = value === solution[row][col];
  input.dataset.invalid = correct ? 'false' : 'true';
  input.dataset.validated = correct ? 'correct' : 'none';
  input.dataset.hint = 'false';
  input.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}, value ${value}${readonlyLabel}`);
}

/**
 * Create the 9x9 board DOM structure
 */
function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  boardDiv.setAttribute('role', 'grid');
  boardDiv.setAttribute('aria-rowcount', String(SIZE));
  boardDiv.setAttribute('aria-colcount', String(SIZE));

  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    rowDiv.setAttribute('role', 'row');

    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.inputMode = 'numeric';
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.dataset.invalid = 'false';
      input.dataset.validated = 'none';
      input.dataset.hint = 'false';
      input.dataset.highlighted = 'false';
      input.setAttribute('role', 'gridcell');
      input.setAttribute('aria-label', `Row ${i + 1}, column ${j + 1}`);
      input.setAttribute('aria-rowindex', String(i + 1));
      input.setAttribute('aria-colindex', String(j + 1));

      // Only allow digits 1-9
      input.addEventListener('input', handleCellInput);
      input.addEventListener('change', validateCell);
      input.addEventListener('keydown', handleKeyDown);

      rowDiv.appendChild(input);
    }

    boardDiv.appendChild(rowDiv);
  }
}

/**
 * Handle cell input - only allow 1-9 or empty
 * @param {Event} e - Input event
 */
function handleCellInput(e) {
  const value = e.target.value.replace(/[^1-9]/g, '');
  e.target.value = value.slice(0, 1);
  updateCellState(e.target);
  refreshBoardInsights();
}

/**
 * Validate a single cell against the solution
 * @param {Event} e - Change event
 */
function validateCell(e) {
  updateCellState(e.target);
  refreshBoardInsights();
}

/**
 * Handle keyboard navigation and shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyDown(e) {
  if (e.target.dataset.prefilled === 'true') return;

  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  let nextInput = null;

  switch (e.key) {
    case 'ArrowUp':
      if (row > 0) {
        nextInput = document.querySelector(
          `[data-row="${row - 1}"][data-col="${col}"]`
        );
      }
      break;
    case 'ArrowDown':
      if (row < SIZE - 1) {
        nextInput = document.querySelector(
          `[data-row="${row + 1}"][data-col="${col}"]`
        );
      }
      break;
    case 'ArrowLeft':
      if (col > 0) {
        nextInput = document.querySelector(
          `[data-row="${row}"][data-col="${col - 1}"]`
        );
      }
      break;
    case 'ArrowRight':
      if (col < SIZE - 1) {
        nextInput = document.querySelector(
          `[data-row="${row}"][data-col="${col + 1}"]`
        );
      }
      break;
    case 'Backspace':
    case 'Delete':
      e.target.value = '';
      updateCellState(e.target);
      refreshBoardInsights();
      break;
  }

  if (nextInput && !nextInput.disabled) {
    e.preventDefault();
    nextInput.focus();
  }
}

/**
 * Render the puzzle on the board
 * @param {Array} puz - The puzzle board
 * @param {Array} sol - The solution board
 */
function renderPuzzle(puz, sol) {
  puzzle = puz;
  solution = sol;
  hintsUsed = 0;
  completionRecorded = false;
  selectedDigit = null;
  createBoardElement();

  const inputs = document.querySelectorAll('.sudoku-cell');
  let cellIndex = 0;

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const input = inputs[cellIndex];
      const value = puzzle[i][j];

      if (value !== 0) {
        input.value = value;
        input.disabled = true;
        input.dataset.prefilled = 'true';
        input.dataset.hint = 'false';
        input.setAttribute('aria-readonly', 'true');
      } else {
        input.value = '';
        input.disabled = false;
        input.dataset.prefilled = 'false';
        input.dataset.hint = 'false';
        input.setAttribute('aria-readonly', 'false');
      }

      updateCellState(input);

      cellIndex++;
    }
  }

  clearMessage();
  updateHintsCounter();
  refreshBoardInsights();
  startTimer();
}

/**
 * Update the displayed hints counter.
 */
function updateHintsCounter() {
  const hintsEl = document.getElementById('hints-used');
  if (hintsEl) {
    hintsEl.textContent = String(hintsUsed);
  }
}

/**
 * Build a 2D board from DOM inputs.
 * @returns {number[][]} Current board values.
 */
function getBoardFromInputs() {
  const inputs = document.querySelectorAll('.sudoku-cell');
  const board = [];

  for (let row = 0; row < SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < SIZE; col++) {
      const idx = row * SIZE + col;
      const value = inputs[idx].value;
      board[row][col] = value ? parseInt(value, 10) : 0;
    }
  }

  return board;
}

/**
 * Create a new game
 */
async function newGame() {
  const difficulty = document.getElementById('difficulty').value;
  currentDifficulty = difficulty;

  try {
    const response = await fetch(`/api/new-game?difficulty=${difficulty}`);
    if (!response.ok) {
      throw new Error('Failed to generate puzzle');
    }

    const data = await response.json();
    renderPuzzle(data.puzzle, data.solution);
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

/**
 * Get a hint for the next empty cell
 */
async function getHint() {
  const board = getBoardFromInputs();

  try {
    const response = await fetch('/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, solution })
    });

    if (!response.ok) {
      throw new Error('Failed to get hint');
    }

    const data = await response.json();

    if (data.value !== undefined) {
      const input = document.querySelector(
        `[data-row="${data.row}"][data-col="${data.col}"]`
      );
      input.value = data.value;
      input.dataset.invalid = 'false';
      input.dataset.validated = 'correct';
      input.dataset.hint = 'true';
      input.dataset.prefilled = 'true';
      input.disabled = true;
      input.setAttribute('aria-readonly', 'true');
      input.setAttribute('aria-label', `Row ${data.row + 1}, column ${data.col + 1}, value ${data.value}, read only`);
      hintsUsed += 1;
      updateHintsCounter();
      refreshBoardInsights();
      showMessage('Hint provided and locked in place.', 'success');
    } else {
      showMessage('Board is already complete!', 'success');
    }
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

/**
 * Check the current board state against the solution
 */
async function checkSolution() {
  const inputs = document.querySelectorAll('.sudoku-cell');
  const board = getBoardFromInputs();

  try {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, solution })
    });

    if (!response.ok) {
      throw new Error('Validation failed');
    }

    const data = await response.json();
    const incorrectSet = new Set(
      data.incorrect.map(([row, col]) => `${row},${col}`)
    );

    // Update all cells
    inputs.forEach((input, idx) => {
      const row = parseInt(input.dataset.row);
      const col = parseInt(input.dataset.col);
      const key = `${row},${col}`;
      const hasValue = input.value !== '';

      if (!input.disabled) {
        input.dataset.invalid = incorrectSet.has(key) ? 'true' : 'false';
        input.dataset.validated = hasValue && !incorrectSet.has(key) ? 'correct' : 'none';
      }
    });

    refreshBoardInsights();

    // Show result message
    if (incorrectSet.size === 0) {
      stopTimer();
      saveCompletedGame();
      showMessage('🎉 Congratulations! You solved it!', 'success');
    } else {
      showMessage(
        `${incorrectSet.size} cell(s) are incorrect. Keep trying!`,
        'error'
      );
    }
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

/**
 * Show a message to the user
 * @param {string} text - Message text
 * @param {string} type - 'success' or 'error'
 */
function showMessage(text, type = '') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

/**
 * Clear the message
 */
function clearMessage() {
  const messageEl = document.getElementById('message');
  messageEl.textContent = '';
  messageEl.className = 'message';
}

// Initialize on page load
window.addEventListener('load', () => {
  // Initialize dark mode
  initializeDarkMode();
  renderLeaderboard();

  // Setup event listeners
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('get-hint').addEventListener('click', getHint);
  document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

  // Start with a new game
  newGame();
});