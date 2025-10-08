import React from 'react';
import { Tile as TileType } from '../types';
import Tile from './Tile';
import { INITIAL_HAND_SIZE } from '../constants';

interface PlayerHandProps {
  hand: TileType[];
  onTileClick: (index: number) => void;
  selectedTileIndex: number | null;
  gridSize: number;
  isBoardTileSelected: boolean;
  onMoveToHand: () => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ hand, onTileClick, selectedTileIndex, gridSize, isBoardTileSelected, onMoveToHand }) => {
  
  const TILE_SIZE_MAP: { [key: number]: string } = {
    5: 'w-16 h-16 md:w-24 md:h-24',
    6: 'w-14 h-14 md:w-20 md:h-20',
    7: 'w-12 h-12 md:w-16 md:h-16',
  };
  const tileSizeClass = TILE_SIZE_MAP[gridSize] || TILE_SIZE_MAP[5];
  const isHandFull = hand.length >= INITIAL_HAND_SIZE;
  const isSwapMode = isBoardTileSelected && isHandFull;
  
  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-700 dark:text-gray-200">Your Hand</h2>
      <div className="flex justify-center items-center gap-2 md:gap-4 min-h-[88px] md:min-h-[120px]">
        {hand.length > 0 ? (
          hand.map((tile, index) => (
              <Tile
                key={tile.id}
                tile={tile}
                isSelected={!isSwapMode && index === selectedTileIndex}
                onClick={() => onTileClick(index)}
                gridSize={gridSize}
                isDiscardTarget={isSwapMode}
              />
            )
          )
        ) : !isBoardTileSelected ? (
          <p className="text-gray-500 dark:text-gray-400">No tiles left!</p>
        ) : null}
        
        {isBoardTileSelected && !isHandFull && (
          <div 
            onClick={onMoveToHand} 
            className={`flex flex-col items-center justify-center rounded-lg shadow-md border-2 border-dashed border-green-500 text-green-500 ${tileSizeClass} cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors`}
            title="Return tile to hand"
            aria-label="Return selected tile to hand"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs font-semibold mt-1">To Hand</span>
         </div>
        )}
      </div>
    </div>
  );
};

export default PlayerHand;
