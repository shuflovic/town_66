
export const SHAPES = ['square', 'triangle', 'circle', 'cross', 'star', 'diamond', 'hexagon'] as const;
export const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'] as const;

export type Shape = typeof SHAPES[number];
export type Color = typeof COLORS[number];

export interface Tile {
  id: number;
  shape: Shape;
  color: Color;
}

export type Board = (Tile | null)[][];

export enum GameState {
  PLAYING,
  GAME_OVER,
}