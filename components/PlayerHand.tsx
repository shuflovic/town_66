
import React from 'react';
import { Tile as TileType } from '../types';
import Tile from './Tile';

interface PlayerHandProps {
  hand: TileType[];
  onTileClick: (index: number) => void;
  selectedTileIndex: number | null;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ hand, onTileClick, selectedTileIndex }) => {
  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-700 dark:text-gray-200">Your Hand</h2>
      <div className="flex justify-center items-center gap-2 md:gap-4">
        {hand.length > 0 ? (
          hand.map((tile, index) => (
            <Tile
              key={tile.id}
              tile={tile}
              isSelected={index === selectedTileIndex}
              onClick={() => onTileClick(index)}
            />
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No tiles left!</p>
        )}
      </div>
    </div>
  );
};

export default PlayerHand;
