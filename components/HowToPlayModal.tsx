import React from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-8 max-w-lg w-full m-4 animate-fade-in-up">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-3xl font-extrabold mb-6 text-center text-cyan-500 dark:text-cyan-400">How to Play</h2>
        
        <ol className="space-y-4 text-lg text-gray-700 dark:text-gray-300 list-decimal list-inside">
          <li>
            The goal is to place as many tiles as possible.
          </li>
          <li>
            Click a tile in your hand, then click an empty spot on the board to place it.
          </li>
          <li>
            You can only place tiles <span className="font-semibold">next to</span> another tile.
          </li>
          <li>
            <span className="font-semibold text-red-500">THE MAIN RULE:</span> No two tiles can share a <span className="font-semibold">color</span> or a <span className="font-semibold">shape</span> in the same row or column.
          </li>
        </ol>

        <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
            >
              Start Playing!
            </button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
