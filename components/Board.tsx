import React from 'react';
import { Board as BoardType, Tile as TileType } from '../types';
import Tile from './Tile';

interface BoardProps {
  board: BoardType;
  onCellClick: (row: number, col: number) => void;
  validMoves: { row: number; col: number }[];
  selectedTile: TileType | null;
  adjacentCells: { row: number; col: number }[];
  showHints: boolean;
  gridSize: number;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, validMoves, selectedTile, adjacentCells, showHints, gridSize }) => {
  const gridColsMap: { [key: number]: string } = {
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
  };
  const gridColsClass = gridColsMap[gridSize] || 'grid-cols-5';

  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-inner">
      <div className={`grid ${gridColsClass} gap-1`}>
        {board.map((row, r) =>
          row.map((tile, c) => {
            const isPlaced = !!tile;
            const isAdjacent = adjacentCells.some(move => move.row === r && move.col === c);
            const isValidMove = validMoves.some(move => move.row === r && move.col === c);

            const isClickable = selectedTile && isAdjacent;

            const getCellClasses = () => {
              if (!isClickable) return 'bg-gray-300 dark:bg-gray-700';
              if (showHints && isValidMove) return 'bg-green-300 dark:bg-green-700 cursor-pointer';
              return 'bg-gray-400 dark:bg-gray-600 cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-500';
            };

            return (
              <div
                key={`${r}-${c}`}
                className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-md transition-colors ${getCellClasses()}`}
                onClick={() => (isClickable ? onCellClick(r, c) : null)}
              >
                {isPlaced ? <Tile tile={tile} /> : (selectedTile && isValidMove && showHints) ? <Tile tile={selectedTile} isGhost={true} /> : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Board;
