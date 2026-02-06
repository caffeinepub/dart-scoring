import { Trophy } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface GameOverScreenProps {
  winnerName: string;
  turns: number;
  onRematch: () => void;
  onNewGame: () => void;
}

export default function GameOverScreen({
  winnerName,
  turns,
  onRematch,
  onNewGame,
}: GameOverScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-6">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Game Over!</CardTitle>
          <CardDescription className="text-lg pt-2">
            Congratulations to the winner
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-2xl font-bold text-primary">{winnerName}</p>
            <p className="text-muted-foreground">
              Finished in <span className="font-semibold text-foreground">{turns}</span> turn{turns !== 1 ? 's' : ''}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={onRematch}
            className="w-full"
            size="lg"
          >
            Rematch
          </Button>
          <Button
            onClick={onNewGame}
            variant="outline"
            className="w-full"
            size="lg"
          >
            New Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
