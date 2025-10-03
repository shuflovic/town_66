import React from 'react';
import { Tile as TileType } from '../types';
import { SHAPE_ICONS, COLOR_CLASSES } from '../constants';

interface TileProps {
  tile: TileType | null;
  onClick?: () => void;
  isSelected?: boolean;
  isGhost?: boolean;
}

const Tile: React.FC<TileProps> = ({ tile, onClick, isSelected = false, isGhost = false }) => {
  if (!tile) {
    return null;
  }

  const colorClass = COLOR_CLASSES[tile.color];
  const shapeIcon = SHAPE_ICONS[tile.shape];
  
  const selectedClasses = isSelected ? 'ring-4 ring-offset-2 ring-cyan-400 dark:ring-offset-gray-800' : '';
  const ghostClasses = isGhost ? 'opacity-50' : '';
  const clickableClasses = onClick ? 'cursor-pointer hover:scale-105 transition-transform' : '';

  return (
    <div 
      className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-lg shadow-md border-2 ${colorClass.bg} ${colorClass.border} ${selectedClasses} ${ghostClasses} ${clickableClasses}`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 ${colorClass.text}`}>
        {shapeIcon}
      </div>
    </div>
  );
};

export default Tile;