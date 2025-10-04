import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, Tile as TileType, Board as BoardType, SHAPES, COLORS } from './types';
import { INITIAL_HAND_SIZE } from './constants';
import Board from './components/Board';
import PlayerHand from './components/PlayerHand';
import GameOverModal from './components/GameOverModal';
import useLocalStorage from './hooks/useLocalStorage';

declare var html2canvas: any;

const shuffleDeck = (deck: TileType[]): TileType[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [gridSize, setGridSize] = useState<number>(5);
  const [board, setBoard] = useState<BoardType>([]);
  const [deck, setDeck] = useState<TileType[]>([]);
  const [playerHand, setPlayerHand] = useState<TileType[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState<string>('Welcome!');
  const [showHints, setShowHints] = useState<boolean>(false);
  const [canShare, setCanShare] = useState<boolean>(false);
  
  const [highScores, setHighScores] = useLocalStorage<{ [key: number]: number }>('town-highScores', { 5: 0, 6: 0, 7: 0 });
  const [lastScores, setLastScores] = useLocalStorage<{ [key: number]: number }>('town-lastScores', { 5: 0, 6: 0, 7: 0 });

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Web Share API with file support is available
    if (navigator.share && typeof navigator.canShare === 'function') {
        const dummyFile = new File([""], "dummy.png", { type: "image/png" });
        if (navigator.canShare({ files: [dummyFile] })) {
            setCanShare(true);
        }
    }
  }, []);

  const generateDeck = useCallback((size: number): TileType[] => {
    const deck: TileType[] = [];
    let id = 0;
    const currentColors = COLORS.slice(0, size);
    const currentShapes = SHAPES.slice(0, size);
    for (const color of currentColors) {
      for (const shape of currentShapes) {
        deck.push({ id: id++, color, shape });
      }
    }
    return deck;
  }, []);
  
  const handleStartGame = useCallback((size: number) => {
    setGridSize(size);
    
    const newDeck = shuffleDeck(generateDeck(size));
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(null));
    
    const firstTile = newDeck.pop()!;
    const center = Math.floor(size / 2);
    newBoard[center][center] = firstTile;

  
    setBoard(newBoard);
    console.log('Board after setBoard:', newBoard);
    setPlayerHand(newDeck.splice(0, INITIAL_HAND_SIZE));
    setDeck(newDeck);
    setMessage('Place a tile adjacent to an existing one.');
    setScore(1);
    setSelectedTileIndex(null);
    setGameState(GameState.PLAYING);
  }, [generateDeck]);
  
  // This effect runs only once on mount to start the first game.
  // handleStartGame is stable due to useCallback with stable dependencies.
  useEffect(() => {
    handleStartGame(5);
  }, [handleStartGame]);

  const isValidPlacement = useCallback((tile: TileType, r: number, c: number, currentBoard: BoardType): boolean => {
    if (currentBoard.length === 0) return true;
    // Check row for duplicate shape or color
    for (let i = 0; i < gridSize; i++) {
      const boardTile = currentBoard[r][i];
      if (boardTile && (boardTile.shape === tile.shape || boardTile.color === tile.color)) {
        return false;
      }
    }
    // Check column for duplicate shape or color
    for (let i = 0; i < gridSize; i++) {
      const boardTile = currentBoard[i][c];
      if (boardTile && (boardTile.shape === tile.shape || boardTile.color === tile.color)) {
        return false;
      }
    }
    return true;
  }, [gridSize]);

  const getAdjacentEmptyCells = useCallback((currentBoard: BoardType): { row: number, col: number }[] => {
    if (currentBoard.length === 0) return [];
    const cells: { row: number, col: number }[] = [];
    const seen = new Set<string>();

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (currentBoard[r][c]) {
          const neighbors = [
            { row: r - 1, col: c }, { row: r + 1, col: c },
            { row: r, col: c - 1 }, { row: r, col: c + 1 }
          ];
          for (const n of neighbors) {
            const key = `${n.row},${n.col}`;
            if (n.row >= 0 && n.row < gridSize && n.col >= 0 && n.col < gridSize && !currentBoard[n.row][n.col] && !seen.has(key)) {
              cells.push(n);
              seen.add(key);
            }
          }
        }
      }
    }
    return cells;
  }, [gridSize]);

  const canMakeMove = useCallback((hand: TileType[], currentBoard: BoardType): boolean => {
    if (currentBoard.length === 0) return true;
    const validSpots = getAdjacentEmptyCells(currentBoard);
    for (const tile of hand) {
      for (const spot of validSpots) {
        if (isValidPlacement(tile, spot.row, spot.col, currentBoard)) {
          return true;
        }
      }
    }
    return false;
  }, [getAdjacentEmptyCells, isValidPlacement]);

  const selectedTile = useMemo(() => {
    return selectedTileIndex !== null ? playerHand[selectedTileIndex] : null;
  }, [selectedTileIndex, playerHand]);
  
  const adjacentCells = useMemo(() => getAdjacentEmptyCells(board), [board, getAdjacentEmptyCells]);

  const validMoves = useMemo(() => {
      if (!selectedTile) return [];
      return adjacentCells.filter(cell => isValidPlacement(selectedTile, cell.row, cell.col, board));
  }, [selectedTile, board, adjacentCells, isValidPlacement]);


  const handleTileSelect = (index: number) => {
    setSelectedTileIndex(index === selectedTileIndex ? null : index);
  };

  const handleCellClick = (r: number, c: number) => {
    if (selectedTileIndex === null) return;
    
    const tileToPlace = playerHand[selectedTileIndex];
    if (isValidPlacement(tileToPlace, r, c, board)) {
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = tileToPlace;
      setBoard(newBoard);
      setScore(prev => prev + 1);

      const newPlayerHand = playerHand.filter((_, i) => i !== selectedTileIndex);
      const newDeck = [...deck];
      if (newDeck.length > 0) {
        newPlayerHand.push(newDeck.pop()!);
      }
      
      setPlayerHand(newPlayerHand);
      setDeck(newDeck);
      setSelectedTileIndex(null);
      setMessage('Nice move! Place your next tile.');
    } else {
      setMessage('Invalid move! No duplicate shape or color in a row or column.');
    }
  };
  
  const handleShare = async () => {
    if (!boardRef.current) return;
    setMessage('Generating share image...');
    try {
        const canvas = await html2canvas(boardRef.current, { 
            logging: false,
            useCORS: true,
            backgroundColor: null
        });
        canvas.toBlob(async (blob) => {
            if (!blob) {
                setMessage('Error creating image.');
                return;
            }
            const file = new File([blob], `town${gridSize}${gridSize}-board.png`, { type: 'image/png' });
            const shareData = {
                title: `Town ${gridSize}${gridSize} Score`,
                text: `I scored ${lastScores[gridSize]} in Town ${gridSize}${gridSize}! Can you beat my score? #Town${gridSize}${gridSize}`,
                url: 'https://shuflovic.github.io/town_66/',
                files: [file],
            };
            await navigator.share(shareData);
            setMessage('Shared successfully!');
        }, 'image/png');
    } catch (error) {
        console.error('Error sharing:', error);
        setMessage('Could not share. Maybe your browser does not support it.');
    }
  };


  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;
    if (board.length === 0) return; // Don't run on initial empty board

    if (!canMakeMove(playerHand, board)) {
      if (playerHand.length === 0) {
        setMessage("Congratulations! You've placed all your tiles!");
      } else {
        setMessage('No valid moves left. Game over!');
      }

      setLastScores(prev => ({...prev, [gridSize]: score}));
      if (score > (highScores[gridSize] ?? 0)) {
        setHighScores(prev => ({...prev, [gridSize]: score}));
      }
      
      setTimeout(() => setGameState(GameState.GAME_OVER), 1500);
    }
  }, [playerHand, board, gameState, canMakeMove, score, gridSize, highScores, setHighScores, setLastScores]);
  
  const handlePlayAgain = () => {
    handleStartGame(gridSize);
  };

  const handleSizeChange = (newSize: number) => {
    if (newSize === gridSize) return;

    if (score > 1 && !window.confirm('This will start a new game. Are you sure?')) {
        return;
    }
    handleStartGame(newSize);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-between p-4 space-y-4">
      <GameOverModal score={lastScores[gridSize] ?? 0} highScore={highScores[gridSize] ?? 0} onPlayAgain={handlePlayAgain} isOpen={gameState === GameState.GAME_OVER} onShare={handleShare} canShare={canShare} />
      
      <header className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Town</h1>
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                {[5, 6, 7].map(size => (
                    <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        aria-pressed={gridSize === size}
                        className={`px-4 py-1 text-md font-bold rounded-md transition-colors ${
                            gridSize === size
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        {size}x{size}
                    </button>
                ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">High Score</div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{highScores[gridSize] ?? 0}</div>
            </div>
            <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{score}</div>
            </div>
             <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Deck</div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{deck.length}</div>
            </div>
            <div className="flex items-center space-x-2 pl-4 border-l border-gray-300 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300" id="show-hints-label">Show Hints</span>
                <button
                    onClick={() => setShowHints(!showHints)}
                    type="button"
                    role="switch"
                    aria-checked={showHints}
                    aria-labelledby="show-hints-label"
                    className={`${
                        showHints ? 'bg-cyan-500' : 'bg-gray-400'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                >
                    <span
                        className={`${
                            showHints ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>
          </div>
      </header>

      <main ref={boardRef} className="flex-grow flex items-center justify-center">
        {board.length > 0 && <Board board={board} onCellClick={handleCellClick} validMoves={validMoves} selectedTile={selectedTile} adjacentCells={adjacentCells} showHints={showHints} gridSize={gridSize}/>}
      </main>

      <footer className="w-full flex flex-col items-center space-y-4">
        <div className="h-10 text-center font-semibold text-lg text-cyan-600 dark:text-cyan-400 transition-opacity">
          {message}
        </div>
        <PlayerHand 
            hand={playerHand} 
            onTileClick={handleTileSelect} 
            selectedTileIndex={selectedTileIndex} 
        />
      </footer>
    </div>
  );
};

export default App;
