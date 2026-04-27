# Copilot Instructions for Sudoku Flask App

## Project Overview
This is a Python Flask web app that implements a fully featured Sudoku game.
Refactor legacy code into modern, modular, maintainable code.

## Language & Framework
- Backend: Python 3.11+ with Flask
- Frontend: Vanilla HTML, CSS (no frameworks unless requested), and JavaScript (ES6+)
- No React, no TypeScript unless explicitly asked

## Code Style — Python
- Follow PEP 8 strictly
- Use type hints on all function signatures
- Use docstrings on every function and class (Google style)
- Prefer list comprehensions over for-loops where readable
- Use `snake_case` for variables and functions, `PascalCase` for classes
- Never use wildcard imports (`from x import *`)
- Handle exceptions explicitly — no bare `except:` blocks
- Keep functions short and single-purpose (under 30 lines preferred)

## Code Style — JavaScript
- Use `const` and `let`, never `var`
- Use arrow functions where appropriate
- Use `async/await` instead of `.then()` chains
- Add JSDoc comments to all functions
- Use camelCase for variables and functions

## Code Style — CSS
- Use CSS custom properties (variables) for colors and spacing
- Support both light mode and dark mode using `prefers-color-scheme` and a toggle class
- Use BEM-style class naming (e.g., `.sudoku-board__cell--prefilled`)
- Ensure responsive design: mobile-first, scale up to desktop
- Alternating 3×3 box colors must use CSS variables

## Project Structure
Keep code organized in logical modules: