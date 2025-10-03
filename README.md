# Town 66 - Digital Edition

This is a digital, single-player adaptation of the tile-laying puzzle game "Town 66". It's a game of logic and spatial reasoning where the goal is to place as many tiles as possible onto the grid while following a simple placement rule.

## Gameplay

The objective is to strategically place tiles on the grid to achieve the highest possible score. The score is simply the total number of tiles you successfully place on the board.

### The Rules

1.  **The Core Rule:** When you place a tile, its **shape** and **color** must be unique within its respective **row** and **column**. You cannot have two tiles of the same shape or two tiles of the same color in any single row or column.
2.  **Placement:** You can only place tiles in empty cells that are directly adjacent (up, down, left, or right) to an existing tile.
3.  **Your Hand:** You always have a hand of four tiles to choose from. After you place a tile, a new one is drawn from the deck to replenish your hand.
4.  **Game End:** The game ends when there are no valid moves left for any of the tiles in your hand. This can happen when all adjacent cells are blocked by the placement rules, or when the board is full.

### How to Play

1.  **Select Board Size:** Choose between a 5x5, 6x6, or 7x7 grid. The game starts on 5x5 by default.
2.  **Select a Tile:** Click on a tile from "Your Hand" at the bottom of the screen.
3.  **Place the Tile:** Click on an empty, adjacent cell on the game board.
    *   If you have "Show Hints" enabled, valid placement cells for the selected tile will be highlighted in green.
4.  **Keep Playing:** Continue placing tiles until no more valid moves are available.
5.  **Beat Your High Score:** Your score for the round is saved, and your high score for each board size is tracked. Try to beat it!

## Features

- **Multiple Board Sizes:** Play on a 5x5, 6x6, or 7x7 grid for varying levels of difficulty. The number of unique shapes and colors corresponds to the grid size.
- **High Score Tracking:** The game saves your personal high score for each board size locally in your browser.
- **Hint System:** Toggle hints on to see all valid potential moves for your currently selected tile.
- **Responsive Design:** Playable on both desktop and mobile devices.
- **Share Your Score:** After the game ends, you can share an image of your final board and score with friends using the Web Share API (on supported browsers).

## Built With

- **React**
- **TypeScript**
- **Tailwind CSS**
