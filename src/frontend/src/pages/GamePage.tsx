import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Undo2 } from 'lucide-react';
import PlayerCard from '../components/game/PlayerCard';
import Keypad from '../components/game/Keypad';
import TurnHistory from '../components/game/TurnHistory';
import DoubleFinishConfirmModal from '../components/game/DoubleFinishConfirmModal';
import GameOverScreen from '../components/game/GameOverScreen';
import { loadGameSettings } from '../lib/gameSettings';
import { 
  startGame, 
  applyTurn, 
  undoLastTurn, 
  confirmDoubleFinish, 
  rejectDoubleFinish,
  type Game 
} from '../lib/gameCore';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function GamePage() {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize game on mount
  useEffect(() => {
    const settings = loadGameSettings();
    const initialGame = startGame(settings);
    setGame(initialGame);
  }, []);

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleDigitPress = (digit: string) => {
    // Build up the input string
    const newInput = currentInput + digit;
    const numValue = parseInt(newInput, 10);
    
    // Only allow values up to 180
    if (numValue <= 180) {
      setCurrentInput(newInput);
    }
  };

  const handleSetInput = (value: string) => {
    // Replace current input with the chip value
    const numValue = parseInt(value, 10);
    if (numValue <= 180) {
      setCurrentInput(value);
    }
  };

  const handleClear = () => {
    setCurrentInput('');
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (!game || currentInput === '') return;

    const scoredPoints = parseInt(currentInput, 10);
    const result = applyTurn(game, scoredPoints);

    if (result.success && result.game) {
      setGame(result.game);
      setCurrentInput('');
      setErrorMessage(null);
    } else {
      // Display error message in UI
      setErrorMessage(result.error || 'Invalid score');
    }
  };

  const handleUndo = () => {
    if (!game) return;
    const newGame = undoLastTurn(game);
    setGame(newGame);
    setErrorMessage(null);
  };

  const handleConfirmYes = () => {
    if (!game) return;
    const newGame = confirmDoubleFinish(game);
    setGame(newGame);
  };

  const handleConfirmNo = () => {
    if (!game) return;
    const newGame = rejectDoubleFinish(game);
    setGame(newGame);
  };

  const handleRematch = () => {
    if (!game) return;
    // Start a new game with the same settings
    const newGame = startGame(game.settings);
    setGame(newGame);
    setCurrentInput('');
    setErrorMessage(null);
  };

  const handleNewGame = () => {
    navigate({ to: '/' });
  };

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  // Show Game Over screen
  if (game.phase === 'game-over' && game.winner) {
    return (
      <GameOverScreen
        winnerName={game.winner.playerName}
        turns={game.winner.turns}
        onRematch={handleRematch}
        onNewGame={handleNewGame}
      />
    );
  }

  const isAwaitingConfirmation = game.phase === 'awaiting-confirmation';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={game.turnHistory.length === 0 || isAwaitingConfirmation}
          className="flex items-center gap-2"
        >
          <Undo2 className="h-4 w-4" />
          Undo
        </Button>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Players</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {game.players.map((player, index) => (
              <PlayerCard
                key={index}
                name={player.name}
                score={player.remaining}
                isActive={index === game.currentPlayerIndex}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Score Entry</h2>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <Keypad
            currentInput={currentInput}
            onDigitPress={handleDigitPress}
            onClear={handleClear}
            onSubmit={handleSubmit}
            onSetInput={handleSetInput}
            disabled={isAwaitingConfirmation}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Turn History</h2>
          <TurnHistory turns={game.turnHistory} />
        </section>
      </div>

      {/* Double Finish Confirmation Modal */}
      <DoubleFinishConfirmModal
        open={isAwaitingConfirmation}
        onYes={handleConfirmYes}
        onNo={handleConfirmNo}
      />
    </div>
  );
}
