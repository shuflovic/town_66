
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GameState, Tile as TileType, Board as BoardType, SHAPES, COLORS } from './types';
import { INITIAL_HAND_SIZE } from './constants';
import Board from './components/Board';
import PlayerHand from './components/PlayerHand';
import GameOverModal from './components/GameOverModal';
import useLocalStorage from './hooks/useLocalStorage';

declare var html2canvas: any;

interface GameHistory {
  board: BoardType;
  playerHand: TileType[];
  deck: TileType[];
  score: number;
}

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
  const [selectedBoardTile, setSelectedBoardTile] = useState<{row: number, col: number} | null>(null);
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState<string>('Welcome!');
  const [showHints, setShowHints] = useState<boolean>(false);
  const [canShare, setCanShare] = useState<boolean>(false);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [gameOverDismissed, setGameOverDismissed] = useState<boolean>(false);
  
  const [highScores, setHighScores] = useLocalStorage<{ [key: number]: number }>('town-highScores', { 5: 0, 6: 0, 7: 0 });
  const [lastScores, setLastScores] = useLocalStorage<{ [key: number]: number }>('town-lastScores', { 5: 0, 6: 0, 7: 0 });

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    setPlayerHand(newDeck.splice(0, INITIAL_HAND_SIZE));
    setDeck(newDeck);
    setMessage('Place a tile adjacent to an existing one.');
    setScore(1);
    setSelectedTileIndex(null);
    setSelectedBoardTile(null);
    setGameState(GameState.PLAYING);
    setHistory([]);
    setGameOverDismissed(false);
  }, [generateDeck]);
  
  useEffect(() => {
    handleStartGame(5);
  }, [handleStartGame]);

  const isValidPlacement = useCallback((tile: TileType, r: number, c: number, currentBoard: BoardType): boolean => {
    if (currentBoard.length === 0) return true;
    for (let i = 0; i < gridSize; i++) {
      const boardTile = currentBoard[r][i];
      if (boardTile && (boardTile.shape === tile.shape || boardTile.color === tile.color)) {
        return false;
      }
    }
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
    if (selectedTileIndex !== null) {
        return playerHand[selectedTileIndex];
    }
    if (selectedBoardTile !== null && board[selectedBoardTile.row]) {
        return board[selectedBoardTile.row][selectedBoardTile.col];
    }
    return null;
  }, [selectedTileIndex, playerHand, selectedBoardTile, board]);
  
  const adjacentCells = useMemo(() => getAdjacentEmptyCells(board), [board, getAdjacentEmptyCells]);
  
  const isRemovalValid = useCallback((currentBoard: BoardType, r: number, c: number): boolean => {
    const tempBoard = currentBoard.map(row => [...row]);
    tempBoard[r][c] = null;

    let remainingTilesCount = 0;
    let startTile: { row: number, col: number } | null = null;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (tempBoard[i][j]) {
                remainingTilesCount++;
                if (!startTile) startTile = { row: i, col: j };
            }
        }
    }

    if (remainingTilesCount <= 1) return true;
    if (!startTile) return true;

    const queue = [startTile];
    const visited = new Set<string>([`${startTile.row},${startTile.col}`]);
    let count = 0;

    while (queue.length > 0) {
        const { row: currR, col: currC } = queue.shift()!;
        count++;
        const neighbors = [{r:currR-1,c:currC},{r:currR+1,c:currC},{r:currR,c:currC-1},{r:currR,c:currC+1}];
        for (const n of neighbors) {
            const key = `${n.r},${n.c}`;
            if (n.r >= 0 && n.r < gridSize && n.c >= 0 && n.c < gridSize && tempBoard[n.r][n.c] && !visited.has(key)) {
                visited.add(key);
                queue.push({row: n.r, col: n.c});
            }
        }
    }
    return count === remainingTilesCount;
  }, [gridSize]);
  
  const validMoves = useMemo(() => {
    if (!selectedTile) return [];

    if (selectedBoardTile) {
        const tileToMove = selectedTile;
        const tempBoard = board.map(row => [...row]);
        tempBoard[selectedBoardTile.row][selectedBoardTile.col] = null;
        
        const possibleSpots = getAdjacentEmptyCells(tempBoard);
        return possibleSpots.filter(cell => isValidPlacement(tileToMove, cell.row, cell.col, tempBoard));
    }
    
    return adjacentCells.filter(cell => isValidPlacement(selectedTile, cell.row, cell.col, board));

  }, [selectedTile, selectedBoardTile, board, adjacentCells, isValidPlacement, getAdjacentEmptyCells]);

  const handleTileSelect = (index: number) => {
    if (selectedBoardTile && playerHand.length >= INITIAL_HAND_SIZE) {
        const tileFromBoard = board[selectedBoardTile.row][selectedBoardTile.col];
        if (!tileFromBoard) return;

        setHistory(prev => [...prev, { board, playerHand, deck, score }]);
        
        const tileToDiscard = playerHand[index];
        const newPlayerHand = [...playerHand];
        newPlayerHand[index] = tileFromBoard;

        const newDeck = [...deck, tileToDiscard];

        const newBoard = board.map(row => [...row]);
        newBoard[selectedBoardTile.row][selectedBoardTile.col] = null;
        
        setBoard(newBoard);
        setPlayerHand(newPlayerHand);
        setDeck(shuffleDeck(newDeck));
        setScore(prev => prev - 1);
        
        setSelectedBoardTile(null);
        setSelectedTileIndex(null);
        setMessage('Tile swapped. Select a tile to place.');
        return;
    }

    setSelectedBoardTile(null);
    setSelectedTileIndex(index === selectedTileIndex ? null : index);
    if (index !== selectedTileIndex) {
        setMessage('Select a valid spot on the board.');
    }
  };

  const handleBoardTileClick = (r: number, c: number) => {
    if (score <= 1) return;

    if (selectedBoardTile && selectedBoardTile.row === r && selectedBoardTile.col === c) {
        setSelectedBoardTile(null);
        setMessage('Select a tile from your hand.');
        return;
    }
    
    if (isRemovalValid(board, r, c)) {
        setSelectedTileIndex(null);
        setSelectedBoardTile({row: r, col: c});
        if (playerHand.length >= INITIAL_HAND_SIZE) {
            setMessage('Move this tile, or click a hand tile to swap.');
        } else {
            setMessage('Move this tile, or return it to your hand.');
        }
    } else {
        setMessage('This tile cannot be moved without disconnecting others.');
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (!selectedTile || !validMoves.some(m => m.row === r && m.col === c)) {
        setMessage('Invalid move! No duplicate shape or color in a row or column.');
        return;
    };

    setHistory(prev => [...prev, { board, playerHand, deck, score }]);
    const newBoard = board.map(row => [...row]);

    if (selectedBoardTile) {
        newBoard[selectedBoardTile.row][selectedBoardTile.col] = null;
        newBoard[r][c] = selectedTile;
        setBoard(newBoard);
        setSelectedBoardTile(null);
        setMessage('Tile moved!');
        return;
    }

    if (selectedTileIndex !== null) {
      newBoard[r][c] = selectedTile;
      setBoard(newBoard);
      setScore(prev => prev + 1);

      const newPlayerHand = playerHand.filter((_, i) => i !== selectedTileIndex);
      const newDeck = [...deck];
      if (newPlayerHand.length < INITIAL_HAND_SIZE && newDeck.length > 0) {
        newPlayerHand.push(newDeck.pop()!);
      }
      
      setPlayerHand(newPlayerHand);
      setDeck(newDeck);
      setSelectedTileIndex(null);
      setMessage('Nice move! Place your next tile.');
    }
  };
  
  const handleMoveToHand = () => {
    if (!selectedBoardTile || playerHand.length >= INITIAL_HAND_SIZE) return;
    const tileToRemove = board[selectedBoardTile.row][selectedBoardTile.col];
    if (!tileToRemove) return;

    setHistory(prev => [...prev, { board, playerHand, deck, score }]);
    
    const newBoard = board.map(row => [...row]);
    newBoard[selectedBoardTile.row][selectedBoardTile.col] = null;
    setBoard(newBoard);
    
    setPlayerHand(prev => [...prev, tileToRemove]);
    setMessage('Tile returned to your hand.');
    setScore(prev => prev - 1);
    setSelectedBoardTile(null);
  };

  const handleUndo = () => {
    if (history.length === 0 || gameState !== GameState.PLAYING) return;
    const lastState = history.pop()!;
    setBoard(lastState.board);
    setPlayerHand(lastState.playerHand);
    setDeck(lastState.deck);
    setScore(lastState.score);
    setHistory(history);
    setGameOverDismissed(false);
    setSelectedTileIndex(null);
    setSelectedBoardTile(null);
    setMessage('Last move undone.');
  };

  const handleShuffle = () => {
    if (deck.length < playerHand.length || gameState !== GameState.PLAYING) return;
    setHistory(prev => [...prev, { board, playerHand, deck, score }]);
    const combined = shuffleDeck([...deck, ...playerHand]);
    const newHand = combined.splice(0, playerHand.length);
    setPlayerHand(newHand);
    setDeck(combined);
    setSelectedTileIndex(null);
    setSelectedBoardTile(null);
    setMessage('Hand shuffled.');
  };
  
  const handleShare = async () => {
    if (!boardRef.current) return;
    setMessage('Generating share image...');
    try {
        const boardCanvas = await html2canvas(boardRef.current, { 
            logging: false,
            useCORS: true,
            backgroundColor: null,
            scale: 2, // Render at double resolution for sharper text
        });

        const headerHeight = 240; // Space for the text, adjusted for scale
        const finalCanvas = document.createElement('canvas');
        const canvasPadding = 80; // Add horizontal padding, adjusted for scale
        finalCanvas.width = boardCanvas.width + canvasPadding;
        finalCanvas.height = boardCanvas.height + headerHeight;
        const ctx = finalCanvas.getContext('2d');

        if (!ctx) {
            setMessage('Could not create image context.');
            return;
        }
        
        // Fill background
        ctx.fillStyle = '#111827'; // gray-900
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        // Draw text
        const currentScore = lastScores[gridSize];
        
        // Title
        ctx.textAlign = 'center';
        ctx.font = 'bold 96px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(`Town ${gridSize}x${gridSize}`, finalCanvas.width / 2, 100);
        
        // Score line
        ctx.font = '66px sans-serif';
        ctx.fillText(`i did  ${currentScore}, can you beat me?`, finalCanvas.width / 2, 190);

        // Draw the captured board image below the text, centered
        ctx.drawImage(boardCanvas, canvasPadding / 2, headerHeight);

        finalCanvas.toBlob(async (blob) => {
            if (!blob) {
                setMessage('Error creating image.');
                return;
            }
            const file = new File([blob], `town${gridSize}x${gridSize}-score.png`, { type: 'image/png' });
            
            // As requested, only the URL is in the message
            const shareData = {
                title: `Town ${gridSize}x${gridSize} Score`,
                text: `https://shuflovic.github.io/town_66`,
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
    if (gameState !== GameState.PLAYING || gameOverDismissed) return;
    if (board.length === 0) return;

    if (!canMakeMove(playerHand, board)) {
      setMessage(playerHand.length === 0 ? "Congratulations! You've placed all your tiles!" : 'No valid moves left. Game over!');
      setLastScores(prev => ({...prev, [gridSize]: score}));
      if (score > (highScores[gridSize] ?? 0)) {
        setHighScores(prev => ({...prev, [gridSize]: score}));
      }
      setTimeout(() => setGameState(GameState.GAME_OVER), 1500);
    }
  }, [playerHand, board, gameState, canMakeMove, score, gridSize, highScores, setHighScores, setLastScores, gameOverDismissed]);
  
  const handlePlayAgain = () => handleStartGame(gridSize);

  const handleCloseGameOverModal = () => {
    setGameState(GameState.PLAYING);
    setGameOverDismissed(true);
    setMessage('Game over. Undo your last move to continue playing.');
  };

  const handleSizeChange = (newSize: number) => {
    if (newSize === gridSize) return;
    if (score > 1 && !window.confirm('This will start a new game. Are you sure?')) return;
    handleStartGame(newSize);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-between p-4 space-y-4">
      <GameOverModal 
        score={lastScores[gridSize] ?? 0} 
        highScore={highScores[gridSize] ?? 0} 
        onPlayAgain={handlePlayAgain} 
        isOpen={gameState === GameState.GAME_OVER} 
        onShare={handleShare} 
        canShare={canShare}
        onClose={handleCloseGameOverModal}
      />
      
      <header className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Town 66</h1>
            <button
                onClick={handleUndo}
                disabled={history.length === 0 || gameState !== GameState.PLAYING}
                aria-label="Undo last move"
                className="text-gray-500 hover:text-cyan-500 disabled:text-gray-300 dark:text-gray-400 dark:hover:text-cyan-400 dark:disabled:text-gray-600 transition-colors disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </button>
            <div className="flex items-center space-x-4 border-l border-gray-300 dark:border-gray-600 pl-6">
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
            </div>
          </div>
      </header>

      <main ref={boardRef} className="flex-grow flex items-center justify-center">
        {board.length > 0 && <Board board={board} onCellClick={handleCellClick} onBoardTileClick={handleBoardTileClick} validMoves={validMoves} selectedTile={selectedTile} selectedBoardTile={selectedBoardTile} adjacentCells={adjacentCells} showHints={showHints} gridSize={gridSize} />}
      </main>

      <footer className="w-full flex flex-col items-center space-y-2">
        <div className="h-10 text-center font-semibold text-lg text-cyan-600 dark:text-cyan-400 transition-opacity flex items-center justify-center">
          {message}
        </div>
        <PlayerHand 
            hand={playerHand} 
            onTileClick={handleTileSelect} 
            selectedTileIndex={selectedTileIndex}
            gridSize={gridSize}
            isBoardTileSelected={!!selectedBoardTile}
            onMoveToHand={handleMoveToHand}
        />
        <div className="w-full max-w-lg flex justify-around items-center p-2 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">Board Size:</span>
                <div className="flex items-center bg-gray-300 dark:bg-gray-700 rounded-lg p-1">
                    {[5, 6, 7].map(size => (
                        <button
                            key={size}
                            onClick={() => handleSizeChange(size)}
                            aria-pressed={gridSize === size}
                            className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${
                                gridSize === size
                                ? 'bg-cyan-500 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'
                            }`}
                        >
                            {size}x{size}
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={handleShuffle}
                disabled={deck.length < playerHand.length || gameState !== GameState.PLAYING}
                aria-label="Shuffle hand"
                className="flex items-center gap-2 p-2 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">Shuffle</span>
            </button>
            <div className="flex items-center space-x-2">
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
      </footer>
    </div>
  );
};

export default App;
