import React from 'react';
import { Shape, Color } from './types';

export const INITIAL_HAND_SIZE = 5;

// Fix: Replaced JSX.Element with React.ReactElement to resolve the 'Cannot find namespace JSX' error.
export const SHAPE_ICONS: Record<Shape, React.ReactElement> = {
  square:   <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4z"></path></svg>,
  triangle: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4L3 20h18z"></path></svg>,
  circle:   <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"></circle></svg>,
  cross:    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>,
  star:     <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>,
  diamond:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L21 12l-9 9-9-9 9-9z"></path></svg>,
  hexagon:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6L12 2L5 6v12l7 4l7-4V6z"></path></svg>,
};

export const COLOR_CLASSES: Record<Color, { bg: string; text: string; border: string }> = {
  red:    { bg: 'bg-red-500',    text: 'text-white', border: 'border-red-700' },
  blue:   { bg: 'bg-blue-500',   text: 'text-white', border: 'border-blue-700' },
  green:  { bg: 'bg-green-500',  text: 'text-white', border: 'border-green-700' },
  yellow: { bg: 'bg-yellow-400', text: 'text-gray-800', border: 'border-yellow-600' },
  purple: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-700' },
  orange: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-700' },
  pink:   { bg: 'bg-pink-500',   text: 'text-white', border: 'border-pink-700' },
};
