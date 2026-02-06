import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import PlayerCard from '../components/game/PlayerCard';
import Keypad from '../components/game/Keypad';
import TurnHistory from '../components/game/TurnHistory';
import { loadGameSettings } from '../lib/gameSettings';

export default function GamePage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: '/' });
  };

  // Load game settings from localStorage
  const settings = loadGameSettings();

  // Initialize players with settings
  const players = settings.players.map((name, index) => ({
    id: index + 1,
    name,
    score: settings.mode,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Players</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                name={player.name}
                score={player.score}
                isActive={player.id === 1}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Score Entry</h2>
          <Keypad />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Turn History</h2>
          <TurnHistory />
        </section>
      </div>
    </div>
  );
}
