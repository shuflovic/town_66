import React, { useState } from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const content = {
  en: {
    title: 'How to Play',
    rules: [
      'The goal is to place as many tiles as possible.',
      'Click a tile in your hand, then click an empty spot on the board to place it.',
      <>You can only place tiles <span className="font-semibold">next to</span> another tile.</>,
      <><span className="font-semibold text-red-500">THE MAIN RULE:</span> No two tiles can share a <span className="font-semibold">color</span> or a <span className="font-semibold">shape</span> in the same row or column.</>,
      <>At the bottom, you can <span className="font-semibold">change board size</span>, <span className="font-semibold">shuffle</span> your hand, or toggle <span className="font-semibold">hints</span>.</>
    ],
    buttonText: 'Start Playing!'
  },
  sk: {
    title: 'Ako hrať',
    rules: [
      'Cieľom hry je umiestniť na plochu čo najviac kociek.',
      'Klikni na kocku v ruke a potom na prázdne miesto na hracej ploche, kam ju chces položiť.',
      <>Kocku môžes položiť iba <span className="font-semibold">vedľa</span> inej kocky. Vedľa, nie diagonálne!</>,
      <><span className="font-semibold text-red-500">HLAVNÉ PRAVIDLO:</span> V jednom riadku alebo stĺpci sa nemôžu nachádzať dve kocky rovnakej <span className="font-semibold">farby</span> alebo <span className="font-semibold">tvaru.</span> Podobne ako Sudoku.</>,
      <>Dolu môžeš <span className="font-semibold">zmeniť veľkosť plochy</span>, <span className="font-semibold">zamiešať</span> karty alebo zapnúť <span className="font-semibold">nápovedy</span>.</>
    ],
    buttonText: 'Začať hrať!'
  }
};


const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [language, setLanguage] = useState<'en' | 'sk'>('en');
  
  if (!isOpen) return null;
  
  const currentContent = content[language];

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-8 max-w-lg w-full m-4 animate-fade-in-up">
        <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${
                  language === 'en'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('sk')}
              aria-pressed={language === 'sk'}
              className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${
                  language === 'sk'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              SK
            </button>
        </div>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-3xl font-extrabold mb-6 pt-8 text-center text-cyan-500 dark:text-cyan-400">{currentContent.title}</h2>
        
        <ol className="space-y-4 text-lg text-gray-700 dark:text-gray-300 list-decimal list-inside">
          {currentContent.rules.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ol>

        <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
            >
              {currentContent.buttonText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
