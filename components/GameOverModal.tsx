import React from 'react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  onPlayAgain: () => void;
  onShare: () => void;
  canShare: boolean;
  isOpen: boolean;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, highScore, onPlayAgain, onShare, canShare, isOpen }) => {
  if (!isOpen) return null;

  const isNewHighScore = score === highScore && score > 0;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-8 text-center max-w-sm w-full animate-fade-in-up">
        <h2 className="text-4xl font-extrabold mb-4 text-cyan-500 dark:text-cyan-400">Game Over!</h2>
        
        {isNewHighScore && (
            <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 mb-4 animate-pulse">
                New High Score!
            </p>
        )}

        <p className="text-lg mb-2 text-gray-600 dark:text-gray-300">You placed</p>
        <p className="text-7xl font-bold mb-6 text-gray-800 dark:text-white">{score}</p>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">tiles on the board.</p>
        
        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        <p className="text-lg text-gray-500 dark:text-gray-400">High Score: <span className="font-bold text-gray-700 dark:text-gray-200">{highScore}</span></p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={onPlayAgain}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 w-full sm:w-auto"
            >
              Play Again
            </button>
            {canShare && (
                <button
                    onClick={onShare}
                    aria-label="Share your score"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-transform transform hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.001l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.367a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Share</span>
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default GameOverModal;