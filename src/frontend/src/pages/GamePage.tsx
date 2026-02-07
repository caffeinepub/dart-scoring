import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Undo2, BarChart3 } from 'lucide-react';
import PlayerCard from '../components/game/PlayerCard';
import Keypad from '../components/game/Keypad';
import ThreeDartsEntry from '../components/game/ThreeDartsEntry';
import TurnHistory from '../components/game/TurnHistory';
import GameOverScreen from '../components/game/GameOverScreen';
import ResumeSavedGamePromptModal from '../components/game/ResumeSavedGamePromptModal';
import VoiceScoreConfirmModal from '../components/game/VoiceScoreConfirmModal';
import { loadGameSettings } from '../lib/gameSettings';
import { 
  startGame, 
  applyTurn,
  applyThreeDartTurn,
  undoLastTurn,
  type Game,
  type Dart
} from '../lib/gameCore';
import { saveGame, loadSavedGame, clearSavedGame } from '../lib/gamePersistence';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { parseVoiceScore } from '../lib/voiceScoreParser';
import { getCheckoutSuggestions } from '../lib/checkoutSuggestions';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

type ScoreEntryMode = 'total' | '3darts';

export default function GamePage() {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [scoreEntryMode, setScoreEntryMode] = useState<ScoreEntryMode>('total');
  const [checkoutHelperEnabled, setCheckoutHelperEnabled] = useState(false);

  // Voice input state
  const [showVoiceConfirm, setShowVoiceConfirm] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceProposedScore, setVoiceProposedScore] = useState<number | null>(null);

  const { isSupported, isListening, transcript, start, stop, reset } = useSpeechRecognition();

  // Initialize game on mount - check for saved game first
  useEffect(() => {
    const savedGame = loadSavedGame();
    if (savedGame) {
      // Show resume prompt
      setShowResumePrompt(true);
      setIsInitializing(false);
    } else {
      // Start new game from settings
      const settings = loadGameSettings();
      const initialGame = startGame(settings);
      setGame(initialGame);
      setIsInitializing(false);
    }
  }, []);

  // Handle speech recognition result
  useEffect(() => {
    if (transcript && !isListening) {
      // Recognition has completed
      const parsedScore = parseVoiceScore(transcript);
      
      // Cap to 180 if needed
      const cappedScore = parsedScore !== null && parsedScore > 180 ? 180 : parsedScore;
      
      setVoiceTranscript(transcript);
      setVoiceProposedScore(cappedScore);
      setShowVoiceConfirm(true);
      reset();
    }
  }, [transcript, isListening, reset]);

  const handleResume = () => {
    const savedGame = loadSavedGame();
    if (savedGame) {
      setGame(savedGame);
    }
    setShowResumePrompt(false);
  };

  const handleDiscard = () => {
    clearSavedGame();
    const settings = loadGameSettings();
    const initialGame = startGame(settings);
    setGame(initialGame);
    setShowResumePrompt(false);
  };

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleStats = () => {
    navigate({ to: '/stats' });
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
      // Save game after successful turn
      saveGame(result.game);
    } else {
      // Display error message in UI
      setErrorMessage(result.error || 'Invalid score');
    }
  };

  const handleThreeDartsSubmit = (darts: Dart[]) => {
    if (!game) return;

    const result = applyThreeDartTurn(game, darts);

    if (result.success && result.game) {
      setGame(result.game);
      setErrorMessage(null);
      // Save game after successful turn
      saveGame(result.game);
    } else {
      // Display error message in UI
      setErrorMessage(result.error || 'Invalid darts');
    }
  };

  const handleUndo = () => {
    if (!game) return;
    const newGame = undoLastTurn(game);
    setGame(newGame);
    setErrorMessage(null);
    // Save game after undo
    saveGame(newGame);
  };

  const handleRematch = () => {
    if (!game) return;
    // Start a new game with the same settings
    const newGame = startGame(game.settings);
    setGame(newGame);
    setCurrentInput('');
    setErrorMessage(null);
    // Clear saved game and save the new game
    clearSavedGame();
    saveGame(newGame);
  };

  const handleNewGame = () => {
    // Clear saved game before navigating to start page
    clearSavedGame();
    navigate({ to: '/' });
  };

  // Voice input handlers
  const handleVoiceStart = () => {
    if (!game) return;
    start();
  };

  const handleVoiceOk = () => {
    if (voiceProposedScore !== null && game) {
      setCurrentInput(voiceProposedScore.toString());
    }
    setShowVoiceConfirm(false);
    setVoiceTranscript('');
    setVoiceProposedScore(null);
  };

  const handleVoiceEdit = () => {
    setShowVoiceConfirm(false);
    setVoiceTranscript('');
    setVoiceProposedScore(null);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  // Show resume prompt if needed
  if (showResumePrompt) {
    return (
      <ResumeSavedGamePromptModal
        open={showResumePrompt}
        onResume={handleResume}
        onDiscard={handleDiscard}
      />
    );
  }

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
        onStats={handleStats}
      />
    );
  }

  // Get checkout suggestions for current player
  const currentPlayer = game.players[game.currentPlayerIndex];
  const checkoutSuggestions = checkoutHelperEnabled
    ? getCheckoutSuggestions(currentPlayer.remaining, game.settings.doubleOut)
    : [];

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
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStats}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Stats
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={game.turnHistory.length === 0}
            className="flex items-center gap-2"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>
        </div>
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

        {/* Checkout Helper Toggle */}
        <section>
          <div className="flex items-center space-x-2">
            <Switch
              id="checkout-helper"
              checked={checkoutHelperEnabled}
              onCheckedChange={setCheckoutHelperEnabled}
            />
            <Label htmlFor="checkout-helper" className="text-sm font-medium cursor-pointer">
              Checkout Helper
            </Label>
          </div>
        </section>

        {/* Checkout Suggestions */}
        {checkoutHelperEnabled && checkoutSuggestions.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Checkout Suggestions ({currentPlayer.remaining})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {checkoutSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        {suggestion.darts.map((dart, dartIndex) => (
                          <span key={dartIndex}>
                            <span className="font-mono font-semibold text-primary">
                              {dart}
                            </span>
                            {dartIndex < suggestion.darts.length - 1 && (
                              <span className="mx-1 text-muted-foreground">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Score Entry</h2>
            <Tabs value={scoreEntryMode} onValueChange={(v) => setScoreEntryMode(v as ScoreEntryMode)}>
              <TabsList>
                <TabsTrigger value="total">Total</TabsTrigger>
                <TabsTrigger value="3darts">3 Darts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {scoreEntryMode === 'total' ? (
            <Keypad
              currentInput={currentInput}
              onDigitPress={handleDigitPress}
              onClear={handleClear}
              onSubmit={handleSubmit}
              onSetInput={handleSetInput}
              disabled={false}
              voiceSupported={isSupported}
              onVoiceStart={handleVoiceStart}
              voiceDisabled={isListening}
            />
          ) : (
            <ThreeDartsEntry
              onSubmit={handleThreeDartsSubmit}
              disabled={false}
            />
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Turn History</h2>
          <TurnHistory turns={game.turnHistory} />
        </section>
      </div>

      {/* Voice Score Confirmation Modal - only for Total mode */}
      {scoreEntryMode === 'total' && (
        <VoiceScoreConfirmModal
          open={showVoiceConfirm}
          transcript={voiceTranscript}
          proposedScore={voiceProposedScore}
          onOk={handleVoiceOk}
          onEdit={handleVoiceEdit}
          disabled={false}
        />
      )}
    </div>
  );
}
